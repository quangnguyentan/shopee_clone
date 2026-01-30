// product-variant/product-variant.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { BaseController } from '@/base/base.controller';
import { ProductVariant } from './entities/product-variant.entity';
import { Auth } from '@/common/decorators/auth.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@Controller('product-variants')
export class ProductVariantController extends BaseController<ProductVariant> {
  constructor(protected readonly service: ProductVariantService) {
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

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.service.findByProduct(+productId);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductVariantDto) {
    return this.service.updateVariant(+id, dto);
  }

  @Auth()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteVariant(+id);
  }
}
