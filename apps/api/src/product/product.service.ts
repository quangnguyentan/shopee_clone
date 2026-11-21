import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
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
import { generateCombinations } from '@/common/utils/generateCombinations';
import { Shop } from '@/shop/entities/shop.entity';
import { slugify } from '@/common/utils/slug.util';
import { createProductVariantSignature } from '@/common/utils/product-variant-signature.util';

type ProductManager = { userId: number; role: 'admin' | 'seller' };

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    repo: Repository<Product>,
  ) {
    super(repo);
  }

  async createProduct(user: ProductManager, dto: CreateProductDto) {
    const shop = await this.getManagedShop(user, dto.shop_id);
    const slug = await this.createProductSlug(shop.id, dto.name);
    const { category_id, ...productFields } = dto;
    return this.create({
      ...productFields,
      category_id: String(category_id),
      shop_id: shop.id,
      slug,
      is_active: dto.status === 'active',
      shop,
      description: dto.description,
    });
  }

  private async getManagedShop(user: ProductManager, requestedShopId?: number) {
    if (user.role === 'admin') {
      if (!requestedShopId) throw new NotFoundException('Shop not found');
      const shop = await this.repo.manager.findOne(Shop, {
        where: { id: String(requestedShopId) },
      });
      if (!shop) throw new NotFoundException('Shop not found');
      return shop;
    }

    const shop = await this.repo.manager.findOne(Shop, {
      where: { user: { id: String(user.userId) } },
    });
    if (!shop) throw new ForbiddenException('Seller has no shop');
    return shop;
  }

  private async assertProductAccess(
    productId: number,
    user: ProductManager,
    manager = this.repo.manager,
  ) {
    const product = await manager.findOne(Product, {
      where: { id: String(productId) },
      relations: ['shop', 'shop.user'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (user.role === 'seller' && product.shop.user.id !== String(user.userId)) {
      throw new ForbiddenException('No permission to access this product');
    }
    return product;
  }

  private async createProductSlug(shopId: string | number, name: string) {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (
      await this.repo.findOne({
        where: { shop_id: String(shopId), slug } as any,
        select: ['id'],
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }
    return slug;
  }

  async updateProduct(
    productId: number,
    user: ProductManager,
    dto: UpdateProductDto,
  ) {
    const product = await this.assertProductAccess(productId, user);
    const { shop_id, category_id, ...updates } = dto;
    const targetShop =
      user.role === 'admin' && shop_id !== undefined
        ? await this.getManagedShop(user, shop_id)
        : product.shop;

    Object.assign(product, updates, {
      shop: targetShop,
      shop_id: targetShop.id,
      category_id:
        category_id === undefined
          ? product.category_id
          : String(category_id),
      is_active:
        dto.status === undefined ? product.is_active : dto.status === 'active',
    });
    return this.repo.save(product);
  }

  async deleteProduct(productId: number, user: ProductManager) {
    await this.assertProductAccess(productId, user);
    await this.repo.manager.transaction(async (manager) => {
      await manager.update(
        Product,
        { id: String(productId) },
        { status: 'inactive', is_active: false },
      );
      await manager.softDelete(Product, String(productId));
    });
    return { success: true, id: String(productId) };
  }

  findByShop(shopId: number) {
    return this.repo.find({
      where: { shop: { id: String(shopId) } },
      relations: ['images'],
      order: { id: 'DESC' },
    });
  }
  async findManagedProducts(query?: PaginationDto, user?: ProductManager) {
    return super.findAll(query, {
      select: ['id', 'name', 'price_min', 'price_max', 'stock', 'status'],
      where:
        user?.role === 'seller'
          ? { shop: { user: { id: String(user.userId) } } }
          : undefined,
      relations: [
        'shop',
        'images',
        'variants',
        'variants.attributes',
        'category',
      ],
    });
  }
  async findOneById(id: number, user?: ProductManager) {
    if (user) await this.assertProductAccess(id, user);
    const product = await this.repo.findOne({
      where: { id: String(id) },
      relations: ['shop', 'images', 'variants', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAllView(query?: PaginationDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;
    const now = new Date();

    const [items, total] = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoin('p.variants', 'v')
      .leftJoin(
        'flash_sale_items',
        'fsi',
        `
        fsi.product_variant_id = v.id
        AND fsi.is_active = true
      `,
      )
      .leftJoin(
        'flash_sales',
        'fs',
        `
        fs.id = fsi.flash_sale_id
        AND fs.is_active = true
        AND fs.start_time <= :now
        AND fs.end_time >= :now
      `,
        { now },
      )
      .where('p.status = :status', { status: 'active' })
      .select([
        'p.id',
        'p.name',
        'p.price_min',
        'p.price_max',
        'p.sold_count',
        'img.id',
        'img.url',
        'img.is_primary',
        'fsi.flash_price',
        'fsi.discount_percent',
      ])
      .take(limit)
      .skip(skip)
      .orderBy('p.id', 'DESC')
      .getManyAndCount();

    return {
      items: items.map((p: any) => ({
        ...p,
        display_price: p.fsi_flash_price ?? p.price_min,
        discount_percent: p.fsi_discount_percent ?? null,
        images: p.images.map((img) => ({
          id: img.id,
          is_primary: img.is_primary,
          ...mapProductImageVariants(img.url),
        })),
      })),
      total,
      page,
      limit,
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

  async createFullProduct(user: ProductManager, dto: CreateProductWithVariantDto) {
    return this.repo.manager.transaction(async (manager) => {
      const combinations = generateCombinations(dto.attributes);

      if (combinations.length !== dto.variants.length) {
        throw new Error('Variant count does not match attribute combinations');
      }

      const prices = dto.variants.map((v) => v.price);
      const stocks = dto.variants.map((v) => v.stock);

      const shop =
        user.role === 'admin'
          ? await manager.findOne(Shop, { where: { id: String(dto.shop_id) } })
          : await manager.findOne(Shop, {
              where: { user: { id: String(user.userId) } },
            });
      if (!shop) {
        throw new ForbiddenException(
          user.role === 'seller' ? 'Seller has no shop' : 'Shop not found',
        );
      }

      // 1️⃣ CREATE PRODUCT
      const product = await manager.save(
        manager.create(Product, {
          name: dto.name,
          slug: await this.createProductSlug(shop.id, dto.name),
          is_active: dto.status === 'active',
          description: dto.description,
          status: dto.status,
          price_min: Math.min(...prices),
          price_max: Math.max(...prices),
          stock: stocks.reduce((a, b) => a + b, 0),
          shop,
          category_id: String(dto.category_id),
        }),
      );

      // 2️⃣ LOAD CATEGORY ATTRIBUTES
      const categoryAttributes = await manager.find(CategoryAttribute, {
        where: { category_id: String(dto.category_id) },
        relations: ['values'],
      });

      const attrMap = new Map(categoryAttributes.map((a) => [a.name, a]));

      // 3️⃣ CREATE VARIANTS
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const variantInput = dto.variants[i];

        const sku = generateSKU({
          shopName: shop.name,
          productName: product.name,
          options: combo.map((c) => c.replace(':', '-')),
        });

        // ✅ SAVE VARIANT FIRST
        const signatureParts: {
          attributeId: string;
          valueId: string | null;
          customValue: string | null;
        }[] = [];

        for (const pair of combo) {
          const [attrName, value] = pair.split(':');
          const categoryAttr = attrMap.get(attrName);

          if (!categoryAttr) {
            throw new Error(`Attribute "${attrName}" not found`);
          }

          if (categoryAttr.type === 'input') {
            signatureParts.push({
              attributeId: categoryAttr.id,
              valueId: null,
              customValue: value,
            });
          } else {
            const attrValue = categoryAttr.values.find(
              (candidate) => candidate.value === value,
            );
            if (!attrValue) {
              throw new Error(
                `Value "${value}" not found for attribute "${attrName}"`,
              );
            }
            signatureParts.push({
              attributeId: categoryAttr.id,
              valueId: attrValue.id,
              customValue: null,
            });
          }
        }

        const variant = await manager.save(
          manager.create(ProductVariant, {
            product,
            sku,
            price: variantInput.price,
            stock: variantInput.stock,
            attribute_signature:
              createProductVariantSignature(signatureParts),
          }),
        );

        // 4️⃣ CREATE ATTRIBUTES (variant_id NOW EXISTS)
        const attributes: ProductVariantAttribute[] = [];

        for (const pair of combo) {
          const [attrName, value] = pair.split(':');
          const categoryAttr = attrMap.get(attrName);

          if (!categoryAttr) {
            throw new Error(`Attribute "${attrName}" not found`);
          }

          if (categoryAttr.type === 'input') {
            attributes.push(
              manager.create(ProductVariantAttribute, {
                variant_id: variant.id,
                attribute_id: categoryAttr.id,
                custom_value: value,
                value_id: null,
              }),
            );
          } else {
            const attrValue = categoryAttr.values.find(
              (v) => v.value === value,
            );

            if (!attrValue) {
              throw new Error(
                `Value "${value}" not found for attribute "${attrName}"`,
              );
            }

            attributes.push(
              manager.create(ProductVariantAttribute, {
                variant_id: variant.id,
                attribute_id: categoryAttr.id,
                value_id: attrValue.id,
                custom_value: null,
              }),
            );
          }
        }

        await manager.save(attributes);
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
    user: ProductManager,
    dto: CreateProductWithVariantDto,
  ) {
    return this.repo.manager.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: String(productId) },
        relations: ['variants', 'shop', 'shop.user'],
      });

      if (!product) throw new Error('Product not found');
      if (
        user.role === 'seller' &&
        product.shop.user.id !== String(user.userId)
      ) {
        throw new ForbiddenException('No permission to update this product');
      }

      const combinations = generateCombinations(dto.attributes);

      if (combinations.length !== dto.variants.length) {
        throw new Error('Variant count does not match attribute combinations');
      }

      const prices = dto.variants.map((v) => v.price);
      const stocks = dto.variants.map((v) => v.stock);

      await manager.save(
        manager.merge(Product, product, {
          name: dto.name,
          is_active: dto.status === 'active',
          description: dto.description,
          status: dto.status,
          price_min: Math.min(...prices),
          price_max: Math.max(...prices),
          stock: stocks.reduce((a, b) => a + b, 0),
          category_id: String(dto.category_id),
        }),
      );

      if (product.variants?.length) {
        await manager.delete(ProductVariantAttribute, {
          variant_id: In(product.variants.map((v) => v.id)),
        });

        await manager.delete(ProductVariant, {
          product: { id: product.id },
        });
      }

      const categoryAttributes = await manager.find(CategoryAttribute, {
        where: { category_id: String(dto.category_id) },
        relations: ['values'],
      });

      const attrMap = new Map(categoryAttributes.map((a) => [a.name, a]));

      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const variantInput = dto.variants[i];

        const sku = generateSKU({
          shopName: product.shop.name,
          productName: product.name,
          options: combo.map((c) => c.replace(':', '-')),
        });

        const signatureParts: {
          attributeId: string;
          valueId: string | null;
          customValue: string | null;
        }[] = [];
        for (const pair of combo) {
          const [attrName, value] = pair.split(':');
          const categoryAttr = attrMap.get(attrName)!;
          if (categoryAttr.type === 'input') {
            signatureParts.push({
              attributeId: categoryAttr.id,
              valueId: null,
              customValue: value,
            });
          } else {
            const attrValue = categoryAttr.values.find(
              (candidate) => candidate.value === value,
            )!;
            signatureParts.push({
              attributeId: categoryAttr.id,
              valueId: attrValue.id,
              customValue: null,
            });
          }
        }

        const variant = await manager.save(
          manager.create(ProductVariant, {
            product,
            sku,
            price: variantInput.price,
            stock: variantInput.stock,
            attribute_signature:
              createProductVariantSignature(signatureParts),
          }),
        );

        const attrs: ProductVariantAttribute[] = [];

        for (const pair of combo) {
          const [attrName, value] = pair.split(':');
          const categoryAttr = attrMap.get(attrName)!;

          if (categoryAttr.type === 'input') {
            attrs.push(
              manager.create(ProductVariantAttribute, {
                variant_id: variant.id,
                attribute_id: categoryAttr.id,
                custom_value: value,
                value_id: null,
              }),
            );
          } else {
            const attrValue = categoryAttr.values.find(
              (v) => v.value === value,
            )!;

            attrs.push(
              manager.create(ProductVariantAttribute, {
                variant_id: variant.id,
                attribute_id: categoryAttr.id,
                value_id: attrValue.id,
                custom_value: null,
              }),
            );
          }
        }

        await manager.save(attrs);
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

  async searchProducts(
    keyword: string,
    query?: PaginationDto,
    userId?: number,
  ) {
    const kw = keyword?.trim().toLowerCase();

    if (kw) {
      await this.repo.manager.insert('search_logs', {
        keyword: kw,
        product_id: null,
        user_id: userId ?? null,
      });
    }

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.repo.findAndCount({
      where: {
        name: ILike(`%${kw}%`),
        status: 'active',
      },
      relations: ['images', 'shop'],
      take: limit,
      skip,
      order: { id: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async getSearchSuggestToday(limit = 10) {
    return this.repo.manager.query(
      `
    SELECT keyword, count
    FROM search_logs
    WHERE DATE(created_at) = CURDATE()
    ORDER BY count DESC
    LIMIT ?
  `,
      [limit],
    );
  }
  async topSold(limit = 10) {
    return this.repo.find({
      where: { status: 'active' },
      order: { sold_count: 'DESC' },
      take: limit,
      relations: ['images', 'shop'],
    });
  }
  async topView(limit = 10) {
    return this.repo.find({
      where: { status: 'active' },
      order: { view_count: 'DESC' },
      take: limit,
      relations: ['images', 'shop'],
    });
  }
  async suggestToday(limit = 10) {
    return this.repo.find({
      where: {
        status: 'active',
        is_featured: true,
      },
      take: limit,
      relations: ['images', 'shop'],
    });
  }

  async flashSaleRanking(limit = 10) {
    return this.repo.manager.query(
      `
    SELECT 
      p.id,
      p.name,
      p.price_min,
      p.price_max,
      p.sold_count,
      fsi.flash_price
    FROM flash_sale_items fsi
    JOIN product_variants pv ON pv.id = fsi.product_variant_id
    JOIN products p ON p.id = pv.product_id
    JOIN flash_sales fs ON fs.id = fsi.flash_sale_id
    WHERE fs.start_time <= NOW()
      AND fs.end_time >= NOW()
      AND p.status = 'active'
    ORDER BY p.sold_count DESC
    LIMIT ?
    `,
      [limit],
    );
  }
  async viewProduct(productId: number, keyword?: string) {
    await this.repo.increment({ id: String(productId) }, 'view_count', 1);

    if (keyword) {
      await this.repo.manager.insert('search_logs', {
        keyword: keyword.trim().toLowerCase(),
        product_id: productId,
      });
    }

    return this.findOneView(productId);
  }

  async topSearchProductToday(limit = 10) {
    return this.repo.manager.query(
      `
    SELECT
      p.id,
      p.name,
      p.price_min,
      p.price_max,
      p.sold_count,
      COUNT(sl.id)::int AS search_count
    FROM search_logs sl
    JOIN products p ON p.id = sl.product_id
    WHERE sl.created_at::date = CURRENT_DATE
      AND p.status = 'active'
    GROUP BY p.id
    ORDER BY search_count DESC
    LIMIT $1
    `,
      [limit],
    );
  }
}
