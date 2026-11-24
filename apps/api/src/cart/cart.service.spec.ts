import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { CartService } from './cart.service';

describe('CartService stock validation', () => {
  const createService = (
    itemRepo: Record<string, jest.Mock>,
    variantRepo: Record<string, jest.Mock>,
  ) =>
    new CartService(
      { findOne: jest.fn(), save: jest.fn() } as unknown as Repository<Cart>,
      itemRepo as unknown as Repository<CartItem>,
      variantRepo as unknown as Repository<ProductVariant>,
    );

  it('rejects adding more units than a product variant has in stock', async () => {
    const cartRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
    };
    const itemRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const variantRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: '10',
        stock: 2,
        product: { status: 'active' },
      }),
    };
    const service = new CartService(
      cartRepo as unknown as Repository<Cart>,
      itemRepo as unknown as Repository<CartItem>,
      variantRepo as unknown as Repository<ProductVariant>,
    );

    await expect(
      service.addItem(7, { variant_id: 10, quantity: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  it('updates the quantity for an item owned by the buyer', async () => {
    const item = {
      id: 2,
      quantity: 1,
      cart: { user: { id: '7' } },
      product_variant: { id: '10' },
    };
    const itemRepo = {
      findOne: jest.fn().mockResolvedValue(item),
      save: jest.fn().mockImplementation((value) => value),
    };
    const variantRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: '10', stock: 3, product: { status: 'active' } }),
    };
    const service = createService(itemRepo, variantRepo);

    await expect(
      service.updateItem(2, 7, { quantity: 3 }),
    ).resolves.toEqual({
      id: 2,
      quantity: 3,
    });
    expect(itemRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 3 }),
    );
  });

  it('does not update a cart item owned by another user', async () => {
    const itemRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 2,
        cart: { user: { id: '8' } },
      }),
      save: jest.fn(),
    };
    const variantRepo = { findOne: jest.fn() };
    const service = createService(itemRepo, variantRepo);

    await expect(
      service.updateItem(2, 7, { quantity: 2 }),
    ).rejects.toMatchObject({ status: 404 });
    expect(variantRepo.findOne).not.toHaveBeenCalled();
    expect(itemRepo.save).not.toHaveBeenCalled();
  });
});
