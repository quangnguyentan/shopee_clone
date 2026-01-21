// auth/guards/roles.guard.ts
import { Role, ROLES_KEY } from '@/common/decorators/roles.decorator';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user?.role) {
      throw new ForbiddenException('Role not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Permission denied');
    }

    return true;
  }
}
