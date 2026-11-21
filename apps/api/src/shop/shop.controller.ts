// shop/shop.controller.ts
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
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BaseController } from '@/base/base.controller';
import { Shop } from './entities/shop.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { OptionalAuth } from '@/common/decorators/optional-auth.decorator';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';
import { PaginationDto } from '@/base/base.dto';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Shops')
@Controller('shops')
export class ShopController extends BaseController<Shop> {
  constructor(protected readonly service: ShopService) {
    super(service);
  }

  @Get('mall')
  getShopeeMallProducts(@Query('limit') limit = 16) {
    return this.service.getShopeeMallActive(Number(limit));
  }

  @OptionalAuth()
  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    return this.service.findForViewer(query, user);
  }

  @OptionalAuth()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    return this.service.findOneForViewer(id, user);
  }

  @AuthRole('admin')
  @Post()
  @ApiAuthenticated()
  create(@Body() dto: CreateShopDto) {
    return this.service.createShop(dto);
  }

  @AuthRole('admin', 'seller')
  @Patch(':id')
  @ApiAuthenticated()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.updateShop(id, user, dto);
  }

  @AuthRole('admin', 'seller')
  @Delete(':id')
  @ApiAuthenticated()
  remove(
    @Param('id') id: string,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.deleteShop(id, user);
  }
}
