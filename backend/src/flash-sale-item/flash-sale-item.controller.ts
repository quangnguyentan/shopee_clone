import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlashSaleItemService } from './flash-sale-item.service';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';

@Controller('flash-sale-item')
export class FlashSaleItemController {
  constructor(private readonly flashSaleItemService: FlashSaleItemService) {}

  @Post()
  create(@Body() createFlashSaleItemDto: CreateFlashSaleItemDto) {
    return this.flashSaleItemService.create(createFlashSaleItemDto);
  }

  @Get()
  findAll() {
    return this.flashSaleItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashSaleItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlashSaleItemDto: UpdateFlashSaleItemDto) {
    return this.flashSaleItemService.update(+id, updateFlashSaleItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashSaleItemService.remove(+id);
  }
}
