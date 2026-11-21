import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { BaseController } from '@/base/base.controller';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';
import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { ManagedUsersQueryDto } from './dto/managed-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiControllerDocs('Users')
@Controller('user')
export class UserController extends BaseController<User> {
  constructor(protected readonly service: UserService) {
    super(service);
  }

  @AuthRole('admin')
  @Post()
  @ApiAuthenticated()
  create(@Body() dto: CreateUserDto) {
    return this.service.createManagedUser(dto);
  }

  @AuthRole('admin')
  @Get()
  @ApiAuthenticated()
  findAll(@Query() query: ManagedUsersQueryDto) {
    return this.service.findManagedUsers(query, query.role);
  }

  @Auth()
  @Get('me')
  @ApiAuthenticated()
  getMe(@CurrentUser() user) {
    return this.service.getMe(user.userId);
  }

  @AuthRole('admin')
  @Get(':id')
  @ApiAuthenticated()
  findOne(@Param('id') id: string) {
    return this.service.findManagedUser(id);
  }

  @AuthRole('admin')
  @Patch(':id')
  @ApiAuthenticated()
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.updateManagedUser(id, dto);
  }

  @AuthRole('admin')
  @Delete(':id')
  @ApiAuthenticated()
  remove(
    @Param('id') id: string,
    @CurrentUser() user?: { userId: number },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.deleteManagedUser(id, user.userId);
  }
}
