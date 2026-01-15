import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService extends BaseService<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    repo: Repository<ProductCategory>,
  ) {
    super(repo);
  }

  async createRelation(dto: { product_id: number; category_id: number }) {
    const exists = await this.repo.findOne({
      where: {
        product_id: dto.product_id,
        category_id: dto.category_id,
      },
    });

    if (exists) {
      throw new ConflictException('Product already belongs to this category');
    }

    return this.create(dto);
  }

  findByProduct(productId: number) {
    return this.repo.find({
      where: { product_id: productId },
      relations: ['category'],
    });
  }

  findByCategory(categoryId: number) {
    return this.repo.find({
      where: { category_id: categoryId },
      relations: ['product'],
    });
  }

  async deleteRelation(productId: number, categoryId: number) {
    return this.repo.delete({
      product_id: productId,
      category_id: categoryId,
    });
  }
}
