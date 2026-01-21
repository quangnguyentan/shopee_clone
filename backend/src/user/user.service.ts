import { Injectable, Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AppException } from '@/common/exceptions/app.exception';
import { USER_ERROR } from '@/common/errors/user.error';
import { BaseService } from '@/base/base.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'role', 'avatar'],
    });

    if (!user) {
      throw new AppException(USER_ERROR.USER_NOT_FOUND);
    }

    return user;
  }
}
