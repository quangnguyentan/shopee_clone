import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from '@/common/decorators/auth.decorator';

@Controller('categories')
export class CategoryController extends BaseController<Category> {
  constructor(protected readonly service: CategoryService) {
    super(service);
  }

  @Get('tree')
  getTree() {
    return this.service.findAllTree();
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string) {
    return this.service.findChildren(+id);
  }

  @Auth()
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.updateCategory(+id, dto);
  }
}
