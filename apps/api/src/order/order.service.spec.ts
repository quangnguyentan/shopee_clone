import { ConflictException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { OrderService } from './order.service';
import { ShopOrderStatus } from '@/common/enums/marketplace.enums';

describe('OrderService', () => {
  const shopRepo = { findOne: jest.fn() };
  const shopOrderRepo = { findAndCount: jest.fn() };
  const orderRepo = { findAndCount: jest.fn(), findOne: jest.fn() };
  const dataSource = { transaction: jest.fn() };
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderService(
      orderRepo as unknown as Repository<Order>,
      shopOrderRepo as unknown as Repository<ShopOrder>,
      shopRepo as unknown as Repository<Shop>,
      dataSource as unknown as DataSource,
    );
  });

  it('limits seller results and items to the seller shop', async () => {
    shopRepo.findOne.mockResolvedValue({ id: 'shop-a' });
    shopOrderRepo.findAndCount.mockResolvedValue([
      [
        {
          id: 'shop-order-1',
          order_id: 'order-1',
          shop_id: 'shop-a',
          shop_order_no: 'SO-1',
          subtotal: '100',
          shipping_fee: '0',
          discount_amount: '0',
          total_amount: '100',
          currency: 'VND',
          status: ShopOrderStatus.PAID,
          shipping_status: 'unfulfilled',
          items: [
            {
              id: 'item-a',
              shop_id: 'shop-a',
              product_name: 'Own shop item',
              sku: 'A',
              price: '100',
              quantity: 1,
            },
            {
              id: 'item-b',
              shop_id: 'shop-b',
              product_name: 'Other shop item',
              sku: 'B',
              price: '900',
              quantity: 9,
            },
          ],
          order: {
            order_no: 'ORDER-1',
            total_amount: '1000',
            shipping_address: { city: 'Hanoi' },
            buyer: { id: 'buyer-1', name: 'Buyer', email: 'buyer@example.com' },
          },
        },
      ],
      1,
    ]);

    const result = await service.findAll(
      { userId: 7, role: 'seller' },
      { page: 1, limit: 10 },
    );

    expect(shopOrderRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { shop_id: 'shop-a' } }),
    );
    expect(result.items[0].items).toHaveLength(1);
    expect(result.items[0].items[0].id).toBe('item-a');
    expect(result.items[0].total_amount).toBe('100');
    expect(result.items[0]).not.toHaveProperty('order_total_amount');
  });

  it('rejects seller status jumps that skip the allowed workflow', async () => {
    shopRepo.findOne.mockResolvedValue({ id: 'shop-a' });
    const manager = {
      findOne: jest.fn().mockResolvedValue({
        id: 'shop-order-1',
        order_id: 'order-1',
        shop_id: 'shop-a',
        status: ShopOrderStatus.PAID,
      }),
      save: jest.fn(),
      create: jest.fn(),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.updateSellerOrderStatus(
        'shop-order-1',
        { status: ShopOrderStatus.SHIPPED },
        { userId: 7, role: 'seller' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
