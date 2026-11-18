import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlashSaleItemService } from './flash-sale-item.service';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';

@Controller('flash-sale-items')
export class FlashSaleItemController {
  constructor(private readonly flashSaleItemService: FlashSaleItemService) {}

  // ADMIN
  @Post()
  create(@Body() dto: CreateFlashSaleItemDto) {
    return this.flashSaleItemService.create(dto);
  }

  // ADMIN
  @Get()
  findAll() {
    return this.flashSaleItemService.findAll();
  }

  // ADMIN
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashSaleItemService.findOne(+id);
  }

  // ADMIN
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFlashSaleItemDto) {
    return this.flashSaleItemService.update(+id, dto);
  }

  // ADMIN
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashSaleItemService.remove(+id);
  }

  // ================= CLIENT =================
  // Lấy item theo flash sale (UI flash sale)
  @Get('/flash-sale/:flashSaleId')
  findByFlashSale(@Param('flashSaleId') id: string) {
    return this.flashSaleItemService.findByFlashSale(+id);
  }
}
