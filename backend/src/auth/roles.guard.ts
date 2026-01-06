import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    const canActivate = super.canActivate(context);
    if (!canActivate) return false;
    if (!requiredRole) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.role !== requiredRole) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
