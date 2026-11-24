import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { ShopOrderStatus } from '@/common/enums/marketplace.enums';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewService } from './product-review.service';

describe('ProductReviewService ownership', () => {
  it('filters public product reviews by rating and returns a product rating breakdown', async () => {
    const reviewBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: 'review-1',
            product_id: '35',
            rating: 5,
            comment: 'Great',
            shop_reply: null,
            shop_replied_at: null,
            created_at: new Date(),
            user: { name: 'Buyer', avatar: null },
          },
        ],
        1,
      ]),
    };
    const ratingBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { rating: '5', count: '3' },
        { rating: '4', count: '1' },
      ]),
    };
    const reviewRepo = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(reviewBuilder)
        .mockReturnValueOnce(ratingBuilder),
    };
    const service = new ProductReviewService(
      reviewRepo as unknown as Repository<ProductReview>,
      {} as Repository<OrderItem>,
      {} as Repository<Product>,
      {} as Repository<Shop>,
    );

    const result = await service.findAllPublic({ page: 1, limit: 8 }, '35', 5);

    expect(reviewBuilder.andWhere).toHaveBeenCalledWith(
      'review.product_id = :productId',
      { productId: '35' },
    );
    expect(reviewBuilder.andWhere).toHaveBeenCalledWith(
      'review.rating = :rating',
      { rating: 5 },
    );
    expect(result.rating_breakdown).toEqual({ 5: 3, 4: 1 });
    expect(result.total).toBe(1);
  });

  it('creates a verified review and refreshes the product rating', async () => {
    const item = {
      id: 'order-item-1',
      order: { buyer_id: '12' },
      shop_order: { status: ShopOrderStatus.COMPLETED },
      product_variant: { product_id: 'product-1' },
    };
    const savedReview = {
      id: 'review-1',
      order_item_id: item.id,
      product_id: item.product_variant.product_id,
      user_id: '12',
      rating: 5,
      comment: 'Great',
      shop_reply: null,
      shop_replied_at: null,
      created_at: new Date(),
    };
    const reviewManager = {
      create: jest.fn((review) => review),
      save: jest.fn().mockResolvedValue(savedReview),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '1', average: '5' }),
      })),
    };
    const productManager = { update: jest.fn() };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === ProductReview ? reviewManager : productManager,
      ),
    };
    const reviewRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      manager: {
        transaction: jest.fn((callback) => callback(manager)),
      },
    };
    const orderItemRepo = {
      findOne: jest.fn().mockResolvedValue(item),
    };
    const service = new ProductReviewService(
      reviewRepo as unknown as Repository<ProductReview>,
      orderItemRepo as unknown as Repository<OrderItem>,
      {} as Repository<Product>,
      {} as Repository<Shop>,
    );

    await service.create(
      {
        order_item_id: item.id,
        product_id: item.product_variant.product_id,
        rating: 5,
        comment: ' Great ',
      },
      { userId: 12, role: 'buyer' },
    );

    expect(reviewManager.save).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'Great', user_id: '12' }),
    );
    expect(productManager.update).toHaveBeenCalledWith('product-1', {
      rating_count: 1,
      rating_avg: 5,
    });
  });

  it('only lets the owner shop reply to its product reviews', async () => {
    const reviewRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'review-1',
        product: { shop_id: 'other-shop' },
      }),
      save: jest.fn(),
    };
    const shopRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'owned-shop' }),
    };
    const service = new ProductReviewService(
      reviewRepo as unknown as Repository<ProductReview>,
      {} as Repository<OrderItem>,
      {} as Repository<Product>,
      shopRepo as unknown as Repository<Shop>,
    );

    await expect(
      service.updateReply(
        'review-1',
        { shop_reply: 'Thanks for your feedback' },
        { userId: 12, role: 'seller' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(reviewRepo.save).not.toHaveBeenCalled();
  });

  it('rejects reviews for another buyer order item', async () => {
    const orderItemRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'order-item-1',
        order: { buyer_id: '99' },
        shop_order: { status: 'completed' },
        product_variant: { product_id: 'product-1' },
      }),
    };
    const reviewRepo = { findOne: jest.fn() };
    const service = new ProductReviewService(
      reviewRepo as unknown as Repository<ProductReview>,
      orderItemRepo as unknown as Repository<OrderItem>,
      {} as Repository<Product>,
      {} as Repository<Shop>,
    );

    await expect(
      service.create(
        {
          order_item_id: 'order-item-1',
          product_id: 'product-1',
          rating: 5,
        },
        { userId: 12, role: 'buyer' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(reviewRepo.findOne).not.toHaveBeenCalled();
  });
});
