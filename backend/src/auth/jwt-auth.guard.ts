import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log('JwtAuthGuard: Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JwtAuthGuard: Missing or invalid token');
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    console.log('JwtAuthGuard: Token:', token);
    try {
      const secret = process.env.JWT_SECRET || 'changeme';
      const payload = jwt.verify(token, secret);
      request.user = payload;
      return true;
    } catch (err) {
      console.log('JwtAuthGuard: Token verification failed:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
