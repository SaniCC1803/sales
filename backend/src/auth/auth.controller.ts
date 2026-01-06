import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    console.log('Login attempt:', body.email, body.password);
    return this.authService.validateUser(body.email, body.password);
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
    await this.usersService.confirmUser(user.id);

    // Redirect to the application's website if set
    try {
      const apps = await this.usersService.applicationsService.findAll();
      if (apps && apps.length > 0 && apps[0].websiteUrl) {
        return res.redirect(apps[0].websiteUrl);
      }
    } catch (e) {
      console.log('Could not redirect to application website:', e);
    }

    return res.send('Email confirmed! You can now log in.');
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
