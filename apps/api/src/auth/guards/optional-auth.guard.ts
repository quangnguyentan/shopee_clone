import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionGuard } from '@/session/guards/session.guard';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const scope = request.headers?.['x-auth-scope'] || 'admin';
    const accessToken = request.cookies?.[`${scope}_access_token`];

    return accessToken ? super.canActivate(context) : true;
  }
}

@Injectable()
export class OptionalSessionGuard extends SessionGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) return true;
    return super.canActivate(context);
  }
}
