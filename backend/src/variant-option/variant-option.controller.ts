import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VariantOptionService } from './variant-option.service';
import { CreateVariantOptionDto } from './dto/create-variant-option.dto';
import { UpdateVariantOptionDto } from './dto/update-variant-option.dto';

@Controller('variant-option')
export class VariantOptionController {
  constructor(private readonly variantOptionService: VariantOptionService) {}

  @Post()
  create(@Body() createVariantOptionDto: CreateVariantOptionDto) {
    return this.variantOptionService.create(createVariantOptionDto);
  }

  @Get()
  findAll() {
    return this.variantOptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variantOptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVariantOptionDto: UpdateVariantOptionDto) {
    return this.variantOptionService.update(+id, updateVariantOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantOptionService.remove(+id);
  }
}
