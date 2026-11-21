import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
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
    const service = new ProductService(
      repo as unknown as Repository<Product>,
    );

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
    const service = new ProductService(
      repo as unknown as Repository<Product>,
    );

    await expect(
      service.updateProduct(1, { userId: 12, role: 'seller' }, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
