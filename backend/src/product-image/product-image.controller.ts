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

@Controller('product-images')
export class ProductImageController {
  constructor(private readonly service: ProductImageService) {}

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

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.deleteById(+id);
  }
  @Auth()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteImage(+id);
  }
}
