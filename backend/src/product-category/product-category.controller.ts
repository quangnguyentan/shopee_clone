import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

@Controller('product-categories')
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Post()
  create(@Body() dto: CreateProductCategoryDto) {
    return this.service.createRelation(dto);
  }

  @Get('product/:id')
  findByProduct(@Param('id') id: number) {
    return this.service.findByProduct(+id);
  }

  @Get('category/:id')
  findByCategory(@Param('id') id: number) {
    return this.service.findByCategory(+id);
  }

  @Delete(':productId/:categoryId')
  remove(
    @Param('productId') productId: number,
    @Param('categoryId') categoryId: number,
  ) {
    return this.service.deleteRelation(+productId, +categoryId);
  }
}
