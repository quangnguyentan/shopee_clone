import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
