import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SessionsService } from '../session.service';

@Injectable()
export class SessionActivityInterceptor implements NestInterceptor {
  constructor(private readonly sessionsService: SessionsService) {}

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();

    const session = req.session;

    if (session?.id) {
      this.sessionsService.touchLastActive(session.id);
    }

    return next.handle();
  }
}
