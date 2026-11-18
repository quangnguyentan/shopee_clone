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
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BaseController } from '@/base/base.controller';
import { Shop } from './entities/shop.entity';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@Controller('shops')
export class ShopController extends BaseController<Shop> {
  constructor(protected readonly service: ShopService) {
    super(service);
  }

  @Get('mall')
  getShopeeMallProducts(@Query('limit') limit = 16) {
    return this.service.getShopeeMallActive(Number(limit));
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Auth()
  @AuthRole('admin')
  @Post()
  createShop(@Body() dto: CreateShopDto) {
    return this.service.createShop(dto);
  }

  @Auth()
  @Patch(':id')
  updateShop(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateShopDto,
  ) {
    return this.service.updateShop(+id, user, dto);
  }

  @Auth()
  @Delete(':id')
  deleteShop(@Param('id') id: string, @CurrentUser() user) {
    return this.service.deleteShop(+id, user.userId);
  }
}
