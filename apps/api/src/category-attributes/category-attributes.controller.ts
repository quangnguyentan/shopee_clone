import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { CategoryAttributeService } from './category-attributes.service';

@Controller('category-attributes')
export class CategoryAttributeController extends BaseController<CategoryAttribute> {
  constructor(protected readonly service: CategoryAttributeService) {
    super(service);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.service.findByCategory(+categoryId);
  }

  @AuthRole('admin')
  @Post()
  create(@Body() dto: Partial<CategoryAttribute> & { category_id: number }) {
    return this.service.create({
      ...dto,
      category: { id: dto.category_id } as any,
    });
  }

  @Get('')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }
}
