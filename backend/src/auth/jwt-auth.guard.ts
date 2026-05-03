import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getAccessSecret } from './jwt-secrets';
import { ACCESS_COOKIE } from './auth.cookies';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const cookieToken = request.cookies?.[ACCESS_COOKIE];
    const authHeader = request.headers['authorization'];
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    const token = cookieToken || headerToken;
    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    try {
      const payload = jwt.verify(token, getAccessSecret());
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
