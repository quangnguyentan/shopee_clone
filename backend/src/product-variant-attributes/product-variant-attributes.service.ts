import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';

@Injectable()
export class ProductVariantAttributeService extends BaseService<ProductVariantAttribute> {
  constructor(
    @InjectRepository(ProductVariantAttribute)
    repo: Repository<ProductVariantAttribute>,
  ) {
    super(repo);
  }

  findByVariant(variantId: number) {
    return this.repo.find({
      where: { variant: { id: variantId } },
      relations: ['attribute', 'value'],
    });
  }
}
