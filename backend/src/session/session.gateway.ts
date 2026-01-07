import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Session } from './entities/session.entity';
console.log(process.env.FRONTEND_ENV, 'process.env.FRONTEND_ENV');
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ENV,
    credentials: true,
  },
})
@Injectable()
export class SessionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register_session')
  handleRegisterSession(client: Socket, sessionId: string) {
    if (!sessionId) return;

    const room = this.getSessionRoom(sessionId);
    client.join(room);
  }

  forceLogoutBySession(sessionId: string) {
    const room = this.getSessionRoom(sessionId);

    this.server.to(room).emit('force_logout', {
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
