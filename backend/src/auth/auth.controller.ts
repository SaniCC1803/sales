import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAccessCookie,
  setRefreshCookie,
} from './auth.cookies';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('activate')
  async activate(@Body() body: { token: string; password: string }) {
    if (!body?.token || !body?.password || body.password.length < 6) {
      throw new UnauthorizedException('Token and a password of at least 6 characters are required');
    }
    await this.authService.activate(body.token, body.password);
    return { ok: true };
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.validateUser(body.email, body.password);
    setAccessCookie(res, result.token);
    setRefreshCookie(res, result.refreshToken);
    return { user: result.user };
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      return res.status(400).send('Invalid confirmation token.');
    }
    const user = await this.usersService.findByConfirmationToken(token);
    if (!user) {
      return res.status(404).send('Invalid or expired confirmation token.');
    }
    if (
      user.confirmationTokenExpiresAt &&
      user.confirmationTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(410).send('Confirmation token has expired.');
    }
    await this.usersService.confirmUser(user.id);

    try {
      const apps = await this.usersService.applicationsService.findAll();
      if (apps && apps.length > 0 && apps[0].websiteUrl) {
        return res.redirect(apps[0].websiteUrl);
      }
    } catch (e) {
      console.error('Could not redirect to application website:', e);
    }

    return res.send('Email confirmed! You can now log in.');
  }

  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken = req.cookies?.[REFRESH_COOKIE];
    if (!cookieToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const result = await this.authService.refreshToken(cookieToken);
    setAccessCookie(res, result.token);
    setRefreshCookie(res, result.refreshToken);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as { id: number; email: string; role: string };
    return { id: user.id, email: user.email, role: user.role };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = Number(req.user?.id);
    if (userId) {
      await this.authService.logout(userId);
    }
    clearAuthCookies(res);
  }
}
