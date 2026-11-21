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

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@ApiControllerDocs('Flash Sales')
@Controller('flash-sales')
export class FlashSaleController {
  constructor(private readonly service: FlashSaleService) {}

  @Post()
  @AuthRole('admin')
  create(@Body() dto: CreateFlashSaleDto) {
    return this.service.create(dto);
  }

  @Get()
  @AuthRole('admin')
  findAll() {
    return this.service.findAll();
  }

  @Get('active/current')
  getActiveFlashSale() {
    return this.service.getActiveFlashSale();
  }

  @Get(':id')
  @AuthRole('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @AuthRole('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashSaleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @AuthRole('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/items')
  @AuthRole('admin')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddFlashSaleItemDto,
  ) {
    return this.service.addItem(id, dto);
  }

  @Delete('items/:id')
  @AuthRole('admin')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeItem(id);
  }
}
