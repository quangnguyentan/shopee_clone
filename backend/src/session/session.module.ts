import { Module } from '@nestjs/common';
import { SessionGateway } from './session.gateway';
import { SessionsService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SessionActivityInterceptor } from './interceptors/session-activity.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), EventEmitterModule.forRoot()],
  providers: [SessionGateway, SessionsService, SessionActivityInterceptor],
  exports: [SessionsService, SessionGateway],
})
export class SessionModule {}
