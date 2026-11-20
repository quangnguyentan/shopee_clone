import { Session } from '@/session/entities/session.entity';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.sessionId) {
      throw new UnauthorizedException('Missing session');
    }

    const session = await this.sessionRepo
      .createQueryBuilder('session')
      .where('session.id = :id', { id: user.sessionId })
      .andWhere('session.revoked = false')
      .andWhere('session."expiresAt" > CURRENT_TIMESTAMP')
      .getOne();

    if (!session) throw new UnauthorizedException('Session revoked');

    req.session = session;

    return true;
  }
}
