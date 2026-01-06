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
    // Issue JWT access token (short-lived)
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    // Issue refresh token (longer-lived)
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshsecret';
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

    // Store refresh token in DB
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
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    // Find user and check stored refresh token matches
    const user = await this.usersService.findByEmail(payload.email);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token does not match');
    }
    // Issue new access token
    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' },
    );
    return { token };
  }
}
