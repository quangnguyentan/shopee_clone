import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShopFollowService } from './shop-follow.service';
import { CreateShopFollowDto } from './dto/create-shop-follow.dto';
import { UpdateShopFollowDto } from './dto/update-shop-follow.dto';

@Controller('shop-follow')
export class ShopFollowController {
  constructor(private readonly shopFollowService: ShopFollowService) {}

  @Post()
  create(@Body() createShopFollowDto: CreateShopFollowDto) {
    return this.shopFollowService.create(createShopFollowDto);
  }

  @Get()
  findAll() {
    return this.shopFollowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopFollowService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopFollowDto: UpdateShopFollowDto) {
    return this.shopFollowService.update(+id, updateShopFollowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopFollowService.remove(+id);
  }
}
