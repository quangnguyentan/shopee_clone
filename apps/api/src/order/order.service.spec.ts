import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { Shipping } from '@/shipping/entities/shipping.entity';
import { PaymentService } from '@/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';
import {
  OrderStatus,
  ShopOrderShippingStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';

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
      {} as PaymentService,
      {} as ConfigService,
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

  it('lists only the current buyer orders and applies pagination and status', async () => {
    orderRepo.findAndCount.mockResolvedValue([[], 0]);

    await expect(
      service.findMine(9, {
        page: 2,
        limit: 5,
        status: OrderStatus.COMPLETED,
      }),
    ).resolves.toEqual({
      items: [],
      total: 0,
      page: 2,
      limit: 5,
    });
    expect(orderRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { buyer_id: '9', status: OrderStatus.COMPLETED },
        take: 5,
        skip: 5,
      }),
    );
  });

  it('stores decimal prices returned by PostgreSQL as fixed-point strings', async () => {
    const variant = {
      id: 'variant-1',
      product_id: 'product-1',
      price: '1496.00',
      stock: 2,
      sku: 'SKU-1',
    };
    const product = {
      id: 'product-1',
      name: 'Product',
      status: 'active',
      shop_id: '11',
      shop: { id: '11', status: 'active' },
      images: [],
    };
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ id: 'cart-1' })
        .mockResolvedValueOnce(variant)
        .mockResolvedValueOnce(product),
      find: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: '3',
            product_variant: { id: variant.id },
            quantity: 1,
          },
        ])
        .mockResolvedValueOnce([]),
      create: jest.fn((_entity, value) => value),
      save: jest.fn(async (entity, value) => {
        if (entity === Order) return { ...value, id: 'order-1' };
        if (entity === ShopOrder) return { ...value, id: 'shop-order-1' };
        return value;
      }),
      delete: jest.fn(),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));
    const paymentService = {
      isMethodAvailable: jest.fn().mockReturnValue(true),
      initializeCheckoutPayment: jest.fn().mockResolvedValue({}),
      failPendingOrder: jest.fn(),
    };
    service = new OrderService(
      orderRepo as unknown as Repository<Order>,
      shopOrderRepo as unknown as Repository<ShopOrder>,
      shopRepo as unknown as Repository<Shop>,
      dataSource as unknown as DataSource,
      paymentService as unknown as PaymentService,
      { get: jest.fn().mockReturnValue('0') } as unknown as ConfigService,
    );

    await service.create(14, {
      shipping_address: {
        receiver_name: 'Buyer',
        phone: '0123456789',
        province_code: 1,
        province_name: 'Hanoi',
        ward_code: 1,
        ward_name: 'Ward',
        address: 'Street',
      },
      payment_method: 'cod',
      selected_item_ids: ['3'],
    });

    const savedOrderItems = manager.save.mock.calls.find(
      ([entity]) => entity === OrderItem,
    );
    expect(savedOrderItems?.[1][0].price).toBe('1496.00');
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
        {
          status: ShopOrderStatus.SHIPPED,
          carrier: 'GHN',
          tracking_number: 'GHN-123',
        },
        { userId: 7, role: 'seller' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('does not let sellers mark an order completed before buyer receipt confirmation', async () => {
    shopRepo.findOne.mockResolvedValue({ id: 'shop-a' });
    const manager = {
      findOne: jest.fn().mockResolvedValue({
        id: 'shop-order-1',
        order_id: 'order-1',
        shop_id: 'shop-a',
        status: ShopOrderStatus.SHIPPED,
      }),
      save: jest.fn(),
      create: jest.fn(),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.updateSellerOrderStatus(
        'shop-order-1',
        { status: ShopOrderStatus.COMPLETED },
        { userId: 7, role: 'seller' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('lets a seller hand a processing order to the carrier', async () => {
    shopRepo.findOne.mockResolvedValue({ id: 'shop-a' });
    const shopOrder = {
      id: 'shop-order-1',
      order_id: 'order-1',
      shop_id: 'shop-a',
      shop_order_no: 'SO-1',
      status: ShopOrderStatus.PROCESSING,
      shipping_status: ShopOrderShippingStatus.PREPARING,
      items: [],
      order: { order_no: 'ORDER-1', buyer: null },
      status_history: [],
    };
    const parentOrder = { id: 'order-1', status: OrderStatus.PROCESSING };
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(shopOrder)
        .mockResolvedValueOnce(parentOrder),
      find: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ status: ShopOrderStatus.SHIPPED }]),
      save: jest.fn(async (entity) => entity),
      create: jest.fn((_entity, value) => value),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.updateSellerOrderStatus(
        'shop-order-1',
        {
          status: ShopOrderStatus.SHIPPED,
          carrier: 'GHN',
          tracking_number: 'GHN-123',
        },
        { userId: 7, role: 'seller' },
      ),
    ).resolves.toMatchObject({
      id: 'shop-order-1',
      status: ShopOrderStatus.SHIPPED,
      shipping_status: ShopOrderShippingStatus.SHIPPED,
    });
    expect(parentOrder.status).toBe(OrderStatus.SHIPPED);
    expect(manager.create).toHaveBeenCalledWith(
      Shipping,
      expect.objectContaining({
        shop_order_id: 'shop-order-1',
        carrier: 'GHN',
        tracking_number: 'GHN-123',
      }),
    );
  });

  it('lets only the buyer confirm a shipped shop order as received', async () => {
    const shopOrder = {
      id: 'shop-order-1',
      order_id: 'order-1',
      status: ShopOrderStatus.SHIPPED,
      shipping_status: ShopOrderShippingStatus.SHIPPED,
      order: { buyer_id: '9' },
    };
    const parentOrder = {
      id: 'order-1',
      status: OrderStatus.SHIPPED,
      payment_status: 'pending',
    };
    const codPayment = { status: 'pending', paid_at: null };
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(shopOrder)
        .mockResolvedValueOnce(parentOrder)
        .mockResolvedValueOnce(codPayment),
      find: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ status: ShopOrderStatus.COMPLETED }]),
      save: jest.fn(async (entity) => entity),
      create: jest.fn((_entity, value) => value),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.completeMyShopOrder('shop-order-1', 9),
    ).resolves.toEqual({
      id: 'shop-order-1',
      status: ShopOrderStatus.COMPLETED,
      shipping_status: ShopOrderShippingStatus.DELIVERED,
    });
    expect(parentOrder.status).toBe(OrderStatus.COMPLETED);
    expect(parentOrder.payment_status).toBe('paid');
    expect(codPayment.status).toBe('succeeded');
    expect(codPayment.paid_at).toBeInstanceOf(Date);
  });

  it('does not reveal another buyer shop order', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValue({
        id: 'shop-order-1',
        order_id: 'order-1',
        status: ShopOrderStatus.SHIPPED,
        order: { buyer_id: 'other-buyer' },
      }),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.completeMyShopOrder('shop-order-1', 9),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
