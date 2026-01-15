// product-variant/product-variant.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from 'src/product/entities/product.entity';
import { VariantOption } from 'src/variant-option/entities/variant-option.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { generateSKU } from '@/common/utils/generateSKU';

@Injectable()
export class ProductVariantService extends BaseService<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    repo: Repository<ProductVariant>,

    private readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async createVariant(dto: CreateProductVariantDto) {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: dto.product_id },
        relations: ['shop'],
      });

      if (!product) throw new NotFoundException('Product not found');

      const sku = generateSKU({
        shopName: product.shop.name,
        productName: product.name,
        options: dto.options.map((o) => `${o.option_name}-${o.option_value}`),
      });

      const variant = manager.create(ProductVariant, {
        sku,
        price: dto.price,
        stock: dto.stock,
        product,
      });

      await manager.save(variant);

      const options = dto.options.map((o) =>
        manager.create(VariantOption, {
          ...o,
          variant,
        }),
      );

      await manager.save(options);

      return manager.findOne(ProductVariant, {
        where: { id: variant.id },
        relations: ['options', 'options.variant'],
      });
    });
  }

  findByProduct(productId: number) {
    return this.repo.find({
      where: { product: { id: productId } } as any,
      relations: ['options', 'options.variant'],
    });
  }

  updateVariant(id: number, dto: UpdateProductVariantDto) {
    return this.updateById(id, dto);
  }

  deleteVariant(id: number) {
    return this.deleteById(id);
  }
}
