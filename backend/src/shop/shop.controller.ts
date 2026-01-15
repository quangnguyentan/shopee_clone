// shop/shop.controller.ts
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BaseController } from '@/base/base.controller';
import { Shop } from './entities/shop.entity';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('shops')
export class ShopController extends BaseController<Shop> {
  constructor(protected readonly service: ShopService) {
    super(service);
  }

  @Auth()
  @Post()
  createShop(@CurrentUser() user, @Body() dto: CreateShopDto) {
    return this.service.createShop(user.userId, dto);
  }

  @Auth()
  @Patch(':id')
  updateShop(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateShopDto,
  ) {
    return this.service.updateShop(+id, user.userId, dto);
  }

  @Auth()
  @Delete(':id')
  deleteShop(@Param('id') id: string, @CurrentUser() user) {
    return this.service.deleteShop(+id, user.userId);
  }
}
