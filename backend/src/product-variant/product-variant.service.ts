// product-variant/product-variant.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { ProductVariant } from './entities/product-variant.entity';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PaginationDto } from '@/base/base.dto';

@Injectable()
export class ProductVariantService extends BaseService<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    repo: Repository<ProductVariant>,

    private readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async findAll(query?: PaginationDto) {
    return super.findAll(query, {
      relations: ['product', 'attributes', 'attributes.variant'],
    });
  }

  async findOneById(id: number) {
    const variant = await this.repo.findOne({
      where: { id },
      relations: ['product', 'attributes', 'attributes.variant'],
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    return variant;
  }

  findByProduct(productId: number) {
    return this.repo.find({
      where: { product: { id: productId } } as any,
      relations: ['attributes', 'attributes.variant'],
    });
  }

  updateVariant(id: number, dto: UpdateProductVariantDto) {
    return this.updateById(id, dto);
  }

  deleteVariant(id: number) {
    return this.deleteById(id);
  }
}
