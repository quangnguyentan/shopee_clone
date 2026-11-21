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

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@ApiControllerDocs('Flash Sale Items')
@Controller('flash-sale-items')
export class FlashSaleItemController {
  constructor(private readonly flashSaleItemService: FlashSaleItemService) {}

  // ADMIN
  @Post()
  @AuthRole('admin')
  create(@Body() dto: CreateFlashSaleItemDto) {
    return this.flashSaleItemService.create(dto);
  }

  // ADMIN
  @Get()
  @AuthRole('admin')
  findAll() {
    return this.flashSaleItemService.findAll();
  }

  // ADMIN
  @Get(':id')
  @AuthRole('admin')
  findOne(@Param('id') id: string) {
    return this.flashSaleItemService.findOne(+id);
  }

  // ADMIN
  @Patch(':id')
  @AuthRole('admin')
  update(@Param('id') id: string, @Body() dto: UpdateFlashSaleItemDto) {
    return this.flashSaleItemService.update(+id, dto);
  }

  // ADMIN
  @Delete(':id')
  @AuthRole('admin')
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
