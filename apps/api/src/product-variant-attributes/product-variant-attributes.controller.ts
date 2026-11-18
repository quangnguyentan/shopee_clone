import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';
import { ProductVariantAttributeService } from './product-variant-attributes.service';

@Controller('product-variant-attributes')
export class ProductVariantAttributeController extends BaseController<ProductVariantAttribute> {
  constructor(protected readonly service: ProductVariantAttributeService) {
    super(service);
  }

  @Get('variant/:variantId')
  findByVariant(@Param('variantId') variantId: string) {
    return this.service.findByVariant(+variantId);
  }

  @Post()
  create(@Body() dto: Partial<ProductVariantAttribute>) {
    return this.service.create(dto);
  }
}
