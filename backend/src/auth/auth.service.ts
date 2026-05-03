import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { getAccessSecret, getRefreshSecret } from './jwt-secrets';

// Pre-computed valid bcrypt hash used to equalize timing when the email is unknown.
// Computed once at module load, never matches a real password.
const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const hashToCompare = user?.password ?? DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !user.isConfirmed || !isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, getAccessSecret(), { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, getRefreshSecret(), { expiresIn: '7d' });

    await this.usersService.update(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, BCRYPT_COST),
    });

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
    type JwtPayload = { email: string; id: number; role: string };
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, getRefreshSecret()) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findByIdWithSecrets(payload.id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token does not match');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Refresh token does not match');
    }

    // Rotate: issue a new refresh token and invalidate the old one.
    const newPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(newPayload, getAccessSecret(), { expiresIn: '1h' });
    const newRefreshToken = jwt.sign(newPayload, getRefreshSecret(), {
      expiresIn: '7d',
    });
    await this.usersService.update(user.id, {
      refreshToken: await bcrypt.hash(newRefreshToken, BCRYPT_COST),
    });

    return { token, refreshToken: newRefreshToken };
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: undefined });
  }

  async activate(token: string, password: string) {
    const user = await this.usersService.findByConfirmationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired confirmation token');
    }
    if (
      user.confirmationTokenExpiresAt &&
      user.confirmationTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Confirmation token has expired');
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);
    await this.usersService.updateRaw(user.id, {
      password: hashedPassword,
      isConfirmed: true,
      confirmationToken: undefined,
      confirmationTokenExpiresAt: null,
    });
  }
}
