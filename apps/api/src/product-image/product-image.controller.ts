import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { BaseController } from '@/base/base.controller';
import { ProductImage } from './entities/product-image.entity';

@Controller('product-images')
export class ProductImageController extends BaseController<ProductImage> {
  constructor(protected readonly service: ProductImageService) {
    super(service);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Post()
  create(@Body() dto: CreateProductImageDto) {
    return this.service.createImage(dto);
  }

  @Get('product/:id')
  findByProduct(@Param('id') id: number) {
    return this.service.findByProduct(+id);
  }

  @Patch(':id/set-primary')
  setPrimary(@Param('id') id: number) {
    return this.service.setPrimary(+id);
  }
}
