import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Session } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const BUYER_URL = process.env.BUYER_ENV;
const ADMIN_URL = process.env.ADMIN_ENV;
const corsOrigins = [BUYER_URL, ADMIN_URL].filter((origin): origin is string =>
  Boolean(origin),
);

@WebSocketGateway({
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
})
@Injectable()
export class SessionGateway {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register_session')
  async handleRegisterSession(client: Socket, sessionId: string) {
    if (!sessionId) return;

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, revoked: false },
    });

    if (!session) {
      client.disconnect();
      return;
    }

    client.join(this.getSessionRoom(sessionId));
  }

  forceLogoutBySession(sessionId: string) {
    const room = this.getSessionRoom(sessionId);

    this.server.to(room).emit('force_logout', {
      sessionId,
      reason: 'Bạn đã bị đăng nhập ở nơi khác',
    });
  }

  @OnEvent('session.revoked')
  handleSessionRevoked(sessions: Session[]) {
    sessions.forEach((s) => {
      this.forceLogoutBySession(s.id);
    });
  }

  private getSessionRoom(sessionId: string) {
    return `session:${sessionId}`;
  }
}
