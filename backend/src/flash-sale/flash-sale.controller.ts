import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { AddFlashSaleItemDto } from './dto/add-flash-sale.dto';

@Controller('flash-sales')
export class FlashSaleController {
  constructor(private readonly service: FlashSaleService) {}

  @Post()
  create(@Body() dto: CreateFlashSaleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('active/current')
  getActiveFlashSale() {
    return this.service.getActiveFlashSale();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashSaleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddFlashSaleItemDto,
  ) {
    console.log(id, dto);
    return this.service.addItem(id, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeItem(id);
  }
}
