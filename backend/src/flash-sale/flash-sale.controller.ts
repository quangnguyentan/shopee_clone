import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';

@Controller('flash-sale')
export class FlashSaleController {
  constructor(private readonly flashSaleService: FlashSaleService) {}

  @Post()
  create(@Body() createFlashSaleDto: CreateFlashSaleDto) {
    return this.flashSaleService.create(createFlashSaleDto);
  }

  @Get()
  findAll() {
    return this.flashSaleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashSaleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlashSaleDto: UpdateFlashSaleDto) {
    return this.flashSaleService.update(+id, updateFlashSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashSaleService.remove(+id);
  }
}
