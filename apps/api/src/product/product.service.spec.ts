import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { createProductVariantSignature } from '@/common/utils/product-variant-signature.util';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

describe('ProductService seller ownership', () => {
  it('creates seller products in the authenticated seller shop, not the submitted shop', async () => {
    const repo = {
      manager: {
        findOne: jest.fn().mockResolvedValue({
          id: 'owned-shop',
          name: 'Owned shop',
        }),
      },
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    const service = new ProductService(repo as unknown as Repository<Product>);

    await service.createProduct(
      { userId: 12, role: 'seller' },
      {
        shop_id: 999,
        category_id: 2,
        name: 'Product',
        description: '',
        price_min: 10,
        price_max: 10,
        stock: 1,
        status: 'active',
      },
    );

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ shop_id: 'owned-shop' }),
    );
    expect(repo.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ shop_id: '999' }),
    );
  });

  it('rejects attempts to edit a product owned by another seller', async () => {
    const repo = {
      manager: {
        findOne: jest.fn().mockResolvedValue({
          id: 'product-1',
          shop: { user: { id: 'different-seller' } },
        }),
      },
    };
    const service = new ProductService(repo as unknown as Repository<Product>);

    await expect(
      service.updateProduct(1, { userId: 12, role: 'seller' }, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('ProductService buyer product filters', () => {
  it('applies category and price filters before paginating buyer products', async () => {
    const queryBuilder: Record<string, jest.Mock> = {};
    for (const method of [
      'leftJoinAndSelect',
      'leftJoin',
      'where',
      'select',
      'take',
      'skip',
      'andWhere',
      'orderBy',
      'addOrderBy',
    ]) {
      queryBuilder[method] = jest.fn(() => queryBuilder);
    }
    queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);

    const repo = {
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    const service = new ProductService(repo as unknown as Repository<Product>);

    await service.findAllView({ page: 2, limit: 10 }, '5', 100, 500, {
      minRating: 4,
      mallOnly: true,
      inStock: true,
      provinceCodes: [1, 79],
      attributeFilters: [{ attributeId: '4', valueIds: ['6', '7'] }],
      sort: 'price-asc',
    });

    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WITH RECURSIVE category_tree'),
      { categoryId: '5' },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'p.price_max >= :minPrice',
      { minPrice: 100 },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      'p.price_min <= :maxPrice',
      { maxPrice: 500 },
    );
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.select).toHaveBeenCalledWith(
      expect.arrayContaining(['p.view_count', 'p.created_at']),
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      4,
      'p.rating_avg >= :minRating',
      { minRating: 4 },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      5,
      'shop.is_mall = true',
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      6,
      'shop.province_code IN (:...provinceCodes)',
      { provinceCodes: [1, 79] },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      7,
      'p.stock > 0',
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      8,
      expect.stringContaining('product_variant_attributes'),
      { attributeId0: '4', valueIds0: ['6', '7'] },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('p.price_min', 'ASC');
  });
});

describe('ProductService buyer product detail', () => {
  it('loads image relations before mapping the buyer detail response', async () => {
    const product = {
      id: '23',
      description: 'Product description',
      images: [
        {
          id: 'image-1',
          url: 'https://example.com/product.jpg',
          is_primary: true,
        },
      ],
    };
    const repo = {
      findOne: jest.fn().mockResolvedValue(product),
    };
    const service = new ProductService(repo as unknown as Repository<Product>);

    const result = await service.findOneView(23);

    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '23' },
        relations: expect.arrayContaining(['images', 'shop', 'variants']),
      }),
    );
    expect(result.images).toHaveLength(1);
    expect(result.images[0]).toMatchObject({
      id: 'image-1',
      is_primary: true,
    });
  });

  describe('ProductService updateFullProduct variants', () => {
    const blackSignature = createProductVariantSignature([
      { attributeId: '4', valueId: '8' },
    ]);
    const baseProduct = {
      id: '23',
      name: 'Jacket',
      shop: { id: '2', name: 'Shop', user: { id: '12' } },
      variants: [
        {
          id: '93',
          attribute_signature: blackSignature,
          sku: 'OLD-SKU',
          price: 10,
          stock: 1,
        },
      ],
    };
    const dto = {
      shop_id: 2,
      category_id: 5,
      name: 'Jacket',
      description: 'Updated jacket',
      status: 'active' as const,
      attributes: [{ name: 'Color', values: ['Black'] }],
      variants: [{ price: 20, stock: 5 }],
    };

    const createService = (
      findOne: jest.Mock,
      findAttributes = [
        {
          id: '4',
          name: 'Color',
          type: 'select',
          values: [
            { id: '8', value: 'Black' },
            { id: '9', value: 'White' },
          ],
        },
      ],
    ) => {
      const manager: Record<string, jest.Mock> = {
        findOne,
        find: jest.fn().mockResolvedValue(findAttributes),
        save: jest.fn((value) => Promise.resolve(value)),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        merge: jest.fn((_entity, current, updates) => ({
          ...current,
          ...updates,
        })),
        create: jest.fn((_entity, value) => value),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      const repo = {
        manager: {
          transaction: jest.fn((callback) => callback(manager)),
        },
      };
      return { service: new ProductService(repo as unknown as Repository<Product>), manager };
    };

    it('updates a matching variant in place and preserves its flash-sale reference', async () => {
      const { service, manager } = createService(
        jest.fn().mockResolvedValueOnce(baseProduct).mockResolvedValueOnce(baseProduct),
      );

      await service.updateFullProduct(23, { userId: 12, role: 'seller' }, dto);

      expect(manager.update).toHaveBeenCalledWith(
        ProductVariant,
        { id: '93' },
        expect.objectContaining({
          price: 20,
          stock: 5,
          attribute_signature: blackSignature,
        }),
      );
      expect(manager.delete).not.toHaveBeenCalledWith(
        ProductVariant,
        expect.anything(),
      );
    });

    it('rejects removing a variant that is still linked to a flash sale', async () => {
      const { service, manager } = createService(
        jest
          .fn()
          .mockResolvedValueOnce(baseProduct)
          .mockResolvedValueOnce({ id: 'flash-sale-item-1' }),
      );

      await expect(
        service.updateFullProduct(23, { userId: 12, role: 'seller' }, {
          ...dto,
          attributes: [{ name: 'Color', values: ['White'] }],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(manager.create).toHaveBeenCalledWith(
        ProductVariant,
        expect.objectContaining({ product_id: '23' }),
      );
      expect(manager.delete).not.toHaveBeenCalledWith(
        ProductVariant,
        expect.anything(),
      );
    });
  });
});
