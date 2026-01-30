import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';
import { CategoryAttributeValueService } from './category-attribute-values.service';

@Controller('category-attribute-values')
export class CategoryAttributeValueController extends BaseController<CategoryAttributeValue> {
  constructor(protected readonly service: CategoryAttributeValueService) {
    super(service);
  }

  @Get('attribute/:attributeId')
  findByAttribute(@Param('attributeId') attributeId: string) {
    return this.service.findByAttribute(+attributeId);
  }

  @AuthRole('admin')
  @Post()
  create(@Body() dto: Partial<CategoryAttributeValue>) {
    return this.service.create(dto);
  }
}
