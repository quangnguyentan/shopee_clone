import { AUTH_ERROR } from '@/common/errors/auth.error';
import { AppException } from '@/common/exceptions/app.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.admin_level !== 2) {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    return true;
  }
}
