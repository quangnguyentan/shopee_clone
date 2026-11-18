import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';

@Injectable()
export class CategoryAttributeValueService extends BaseService<CategoryAttributeValue> {
  constructor(
    @InjectRepository(CategoryAttributeValue)
    repo: Repository<CategoryAttributeValue>,
  ) {
    super(repo);
  }

  findByAttribute(attributeId: number) {
    return this.repo.find({
      where: { attribute: { id: attributeId } },
      order: { id: 'ASC' },
    });
  }
}
