// sessions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Session } from './entities/session.entity';
import { RefreshToken } from '@/auth/entities/refresh-token.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createSession(data: {
    userId: number;
    ip: string;
    deviceType: 'mobile' | 'desktop';
    userAgent?: string;
  }) {
    const oldSessions = await this.sessionRepo.find({
      where: {
        userId: data.userId,
        deviceType: data.deviceType,
        revoked: false,
      },
    });
    if (oldSessions.length) {
      const ids = oldSessions.map((s) => s.id);
      await this.sessionRepo.manager.transaction(async (manager) => {
        await manager.update(Session, { id: In(ids) }, { revoked: true });
        await manager.delete(RefreshToken, { sessionId: In(ids) });
      });
      this.eventEmitter.emit('session.revoked', oldSessions);
    }
    const session = await this.sessionRepo.create({ ...data, revoked: false });
    return await this.sessionRepo.save(session);
  }

  async revokeSession(sessionId: string, options?: { silent?: boolean }) {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) return;

    await this.sessionRepo.manager.transaction(async (manager) => {
      await manager.update(Session, sessionId, { revoked: true });
      await manager.delete(RefreshToken, { sessionId });
    });
    if (!options?.silent) {
      this.eventEmitter.emit('session.revoked', [session]);
    }
  }

  async revokeAll(userId: number) {
    const sessions = await this.sessionRepo.find({
      where: { userId, revoked: false },
    });

    if (!sessions.length) return;

    const ids = sessions.map((s) => s.id);

    await this.sessionRepo.manager.transaction(async (manager) => {
      await manager.update(Session, { id: In(ids) }, { revoked: true });
      await manager.delete(RefreshToken, { sessionId: In(ids) });
    });

    this.eventEmitter.emit('session.revoked', sessions);
  }

  async findById(id: string) {
    return this.sessionRepo.findOne({ where: { id } });
  }

  async touchLastActive(id: string) {
    await this.sessionRepo.update(id, {
      lastActive: new Date(),
    });
  }
}
