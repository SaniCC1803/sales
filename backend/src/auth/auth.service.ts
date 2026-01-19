import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isConfirmed) {
      throw new UnauthorizedException(
        'Invalid credentials or email not confirmed',
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshsecret';
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

    await this.usersService.update(user.id, { refreshToken });

    return {
      token,
      refreshToken,
      user: payload,
    };
  }
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshsecret';
    type JwtPayload = { email: string; id: number; role: string };
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findByEmail(payload.email);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token does not match');
    }
    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' },
    );
    return { token };
  }
}
