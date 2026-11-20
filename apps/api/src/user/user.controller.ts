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

import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { BaseController } from '@/base/base.controller';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Users')
@Controller('user')
export class UserController extends BaseController<User> {
  constructor(protected readonly service: UserService) {
    super(service);
  }
  @Auth()
  @Get('me')
  @ApiAuthenticated()
  getMe(@CurrentUser() user) {
    return this.service.getMe(user.userId);
  }
}
