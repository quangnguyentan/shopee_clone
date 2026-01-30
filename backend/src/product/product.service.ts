import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@/base/base.dto';
import { mapProductImageVariants } from '@/common/utils/product-image.mapper';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { ProductVariantAttribute } from '@/product-variant-attributes/entities/product-variant-attribute.entity';
import { CreateProductWithVariantDto } from './dto/create-product-full.dto';
import { generateSKU } from '@/common/utils/generateSKU';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';
import { renderRichText } from '@/common/utils/render-rich-text.util';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    repo: Repository<Product>,
  ) {
    super(repo);
  }

  async createProduct(userId: number, dto: CreateProductDto) {
    return this.create({
      ...dto,

      shop: { id: dto.shop_id } as any,
      description: dto.description,
    });
  }

  async updateProduct(
    productId: number,
    userId: number,
    dto: UpdateProductDto,
  ) {
    return this.updateById(productId, {
      ...dto,
      description: dto.description ?? undefined,
    });
  }

  async deleteProduct(productId: number, userId: number) {
    return this.deleteById(productId);
  }

  findByShop(shopId: number) {
    return this.repo.find({
      where: { shop: { id: shopId } },
      relations: ['images'],
      order: { id: 'DESC' },
    });
  }
  async findAll(query?: PaginationDto) {
    return super.findAll(query, {
      select: ['id', 'name', 'price_min', 'price_max', 'stock', 'status'],
      relations: [
        'shop',
        'images',
        'variants',
        'variants.attributes',
        'category',
      ],
    });
  }
  async findOneById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['shop', 'images', 'variants', 'category'],
    });
  }

  async findAllView(query?: PaginationDto) {
    const result = await super.findAll(query, {
      select: ['id', 'name', 'price_min', 'price_max', 'stock', 'status'],
      relations: [
        'shop',
        'images',
        'variants',
        'variants.attributes',
        'category',
      ],
    });

    return {
      ...result,
      items: result.items.map((product) => ({
        ...product,
        images: product.images.map((img) => ({
          id: img.id,
          is_primary: img.is_primary,
          ...mapProductImageVariants(img.url),
        })),
      })),
    };
  }
  async findOneView(id: number) {
    const product = await super.findOneById(id);
    if (!product) return null;

    return {
      ...product,
      description: renderRichText(product.description),
      images: product.images.map((img) => ({
        id: img.id,
        is_primary: img.is_primary,
        ...mapProductImageVariants(img.url),
      })),
    };
  }

  async createFullProduct(userId: number, dto: CreateProductWithVariantDto) {
    return this.repo.manager.transaction(async (manager) => {
      const prices = dto.variants.map((v) => v.price);
      const price_min = Math.min(...prices);
      const price_max = Math.max(...prices);
      const totalStock = dto.variants.reduce((sum, v) => sum + v.stock, 0);

      const product = manager.create(Product, {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        stock: totalStock,
        price_min,
        price_max,
        shop: { id: dto.shop_id } as any,
        category_id: dto.category_id,
      });

      await manager.save(product);

      const categoryAttributes = await manager.find(CategoryAttribute, {
        where: { category_id: dto.category_id },
        relations: ['values'],
      });

      const attrMap = new Map(categoryAttributes.map((a) => [a.name, a]));

      for (const [index, v] of dto.variants.entries()) {
        const options =
          v.attributes && v.attributes.length > 0
            ? v.attributes.map((a) => `${a.attribute_name}-${a.value}`)
            : [`DEFAULT-${index + 1}`];
        const sku =
          v.sku ??
          generateSKU({
            shopName: product.shop?.name ?? 'SHOP',
            productName: product.name,
            options,
          });

        const variant = manager.create(ProductVariant, {
          product,
          sku,
          price: v.price,
          stock: v.stock,
          attributes: [],
        });

        if (v.attributes && v.attributes.length > 0) {
          for (const attr of v.attributes) {
            const categoryAttr = attrMap.get(attr.attribute_name);
            if (!categoryAttr) {
              throw new Error(
                `Attribute "${attr.attribute_name}" not found in category`,
              );
            }

            if (categoryAttr.type === 'input') {
              variant.attributes.push(
                manager.create(ProductVariantAttribute, {
                  attribute_id: categoryAttr.id,
                  custom_value: attr.value,
                  value_id: null,
                }),
              );
            } else {
              const attrValue = categoryAttr.values.find(
                (val) => val.value === attr.value,
              );

              if (!attrValue) {
                throw new Error(
                  `Value "${attr.value}" not found for attribute "${categoryAttr.name}"`,
                );
              }

              variant.attributes.push(
                manager.create(ProductVariantAttribute, {
                  attribute_id: categoryAttr.id,
                  value_id: attrValue.id,
                  custom_value: null,
                }),
              );
            }
          }
        }

        await manager.save(variant);
      }
      return manager.findOne(Product, {
        where: { id: product.id },
        relations: {
          variants: {
            attributes: {
              attribute: true,
              value: true,
            },
          },
          images: true,
          category: true,
        },
      });
    });
  }
  async updateFullProduct(
    productId: number,
    userId: number,
    dto: CreateProductWithVariantDto,
  ) {
    return this.repo.manager.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: productId },
        relations: ['variants', 'variants.attributes', 'shop'],
      });
      if (!product) {
        throw new Error('Product not found');
      }

      const prices = dto.variants.map((v) => v.price);
      const price_min = Math.min(...prices);
      const price_max = Math.max(...prices);
      const totalStock = dto.variants.reduce((sum, v) => sum + v.stock, 0);

      manager.merge(Product, product, {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        price_min,
        price_max,
        stock: totalStock,
        category_id: dto.category_id,
      });

      await manager.save(product);

      if (product.variants?.length) {
        await manager.delete(ProductVariantAttribute, {
          variant: { id: In(product.variants.map((v) => v.id)) },
        });

        await manager.delete(ProductVariant, {
          product: { id: product.id },
        });
      }

      const categoryAttributes = await manager.find(CategoryAttribute, {
        where: { category_id: dto.category_id },
        relations: ['values'],
      });

      const attrMap = new Map(categoryAttributes.map((a) => [a.name, a]));

      for (const [index, v] of dto.variants.entries()) {
        const options =
          v.attributes && v.attributes.length > 0
            ? v.attributes.map((a) => `${a.attribute_name}-${a.value}`)
            : [`DEFAULT-${index + 1}`];

        const sku =
          v.sku ??
          generateSKU({
            shopName: product.shop?.name ?? 'SHOP',
            productName: product.name,
            options,
          });

        const variant = manager.create(ProductVariant, {
          product,
          sku,
          price: v.price,
          stock: v.stock,
          attributes: [],
        });

        if (v.attributes?.length) {
          for (const attr of v.attributes) {
            const categoryAttr = attrMap.get(attr.attribute_name);

            if (!categoryAttr) {
              throw new Error(
                `Attribute "${attr.attribute_name}" not found in category`,
              );
            }

            if (categoryAttr.type === 'input') {
              variant.attributes.push(
                manager.create(ProductVariantAttribute, {
                  attribute_id: categoryAttr.id,
                  custom_value: attr.value,
                  value_id: null,
                }),
              );
            } else {
              const attrValue = categoryAttr.values.find(
                (val) => val.value === attr.value,
              );

              if (!attrValue) {
                throw new Error(
                  `Value "${attr.value}" not found for attribute "${categoryAttr.name}"`,
                );
              }

              variant.attributes.push(
                manager.create(ProductVariantAttribute, {
                  attribute_id: categoryAttr.id,
                  value_id: attrValue.id,
                  custom_value: null,
                }),
              );
            }
          }
        }

        await manager.save(variant);
      }

      return manager.findOne(Product, {
        where: { id: product.id },
        relations: {
          variants: {
            attributes: {
              attribute: true,
              value: true,
            },
          },
          images: true,
          category: true,
        },
      });
    });
  }
}
