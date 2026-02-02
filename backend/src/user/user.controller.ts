import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { BaseController } from '@/base/base.controller';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@Controller('user')
export class UserController extends BaseController<User> {
  constructor(protected readonly service: UserService) {
    super(service);
  }
  @Auth()
  @Get('me')
  getMe(@CurrentUser() user) {
    return this.service.getMe(user.userId);
  }
  @AuthRole("admin")
  @Get("")
  get() {
    return 
  }
}
