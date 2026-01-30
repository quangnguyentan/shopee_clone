import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { PaginationDto } from '@/base/base.dto';

@Injectable()
export class CategoryAttributeService extends BaseService<CategoryAttribute> {
  constructor(
    @InjectRepository(CategoryAttribute)
    repo: Repository<CategoryAttribute>,
  ) {
    super(repo);
  }

  findAll(query?: PaginationDto) {
    return super.findAll(query, {
      relations: ['category', 'values'],
    });
  }
  async findOneById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'values'],
    });
  }
  findByCategory(categoryId: number) {
    return this.repo.find({
      where: { category: { id: categoryId } },
      relations: ['values'],
      order: { id: 'ASC' },
    });
  }
}
