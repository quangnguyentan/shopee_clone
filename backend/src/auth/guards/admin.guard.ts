import { AUTH_ERROR } from '@/common/errors/auth.error';
import { AppException } from '@/common/exceptions/app.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.role !== 'admin') {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppException(AUTH_ERROR.ADMIN_NOT_APPROVED);
    }

    return true;
  }
}
