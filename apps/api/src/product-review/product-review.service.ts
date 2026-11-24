import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaginationDto } from '@/base/base.dto';
import { ShopOrderStatus } from '@/common/enums/marketplace.enums';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { ProductReview } from './entities/product-review.entity';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewReplyDto } from './dto/update-product-review-reply.dto';

type ReviewActor = { userId: number; role: 'admin' | 'seller' | 'buyer' };

@Injectable()
export class ProductReviewService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepo: Repository<ProductReview>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
  ) {}

  async create(dto: CreateProductReviewDto, actor: ReviewActor) {
    const item = await this.orderItemRepo.findOne({
      where: { id: dto.order_item_id },
      relations: ['order', 'shop_order', 'product_variant'],
    });
    if (!item || item.order.buyer_id !== String(actor.userId)) {
      throw new NotFoundException('Completed order item not found');
    }
    if (
      item.product_variant.product_id !== dto.product_id ||
      item.shop_order.status !== ShopOrderStatus.COMPLETED
    ) {
      throw new ForbiddenException(
        'Reviews are allowed only for products in completed orders',
      );
    }
    if (
      await this.reviewRepo.findOne({
        where: { order_item_id: item.id },
        select: ['id'],
      })
    ) {
      throw new ConflictException('This order item has already been reviewed');
    }

    return this.reviewRepo.manager.transaction(async (manager) => {
      const review = manager.getRepository(ProductReview).create({
        order_item_id: item.id,
        product_id: item.product_variant.product_id,
        user_id: String(actor.userId),
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        media_urls: dto.media_urls ?? [],
      });
      const saved = await manager.getRepository(ProductReview).save(review);
      await this.refreshProductRating(manager, review.product_id);
      return this.toPublicReview(saved);
    });
  }

  async findAllPublic(
    query: PaginationDto,
    productId?: string,
    rating?: number,
  ) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const builder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (productId) {
      builder.andWhere('review.product_id = :productId', { productId });
    }
    if (rating !== undefined) {
      builder.andWhere('review.rating = :rating', { rating });
    }
    const [reviews, total] = await builder.getManyAndCount();
    const ratingBreakdown = productId
      ? await this.reviewRepo
          .createQueryBuilder('rating_review')
          .select('rating_review.rating', 'rating')
          .addSelect('COUNT(rating_review.id)', 'count')
          .where('rating_review.product_id = :productId', { productId })
          .groupBy('rating_review.rating')
          .getRawMany<{ rating: string; count: string }>()
      : [];

    return {
      items: reviews.map((review) => this.toPublicReview(review)),
      total,
      page,
      limit,
      rating_breakdown: Object.fromEntries(
        ratingBreakdown.map(({ rating, count }) => [rating, Number(count)]),
      ),
    };
  }

  async findManaged(actor: ReviewActor, query: PaginationDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const builder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (actor.role === 'seller') {
      const shopId = await this.findSellerShopId(actor.userId);
      builder.andWhere('product.shop_id = :shopId', { shopId });
    }

    const [reviews, total] = await builder.getManyAndCount();
    return {
      items: reviews.map((review) => this.toPublicReview(review)),
      total,
      page,
      limit,
    };
  }

  async findMyOrderItemIds(userId: number) {
    const reviews = await this.reviewRepo.find({
      where: { user_id: String(userId) },
      select: ['order_item_id'],
    });
    return reviews
      .map((review) => review.order_item_id)
      .filter((id): id is string => id !== null);
  }

  async findOne(id: string) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    if (!review) throw new NotFoundException('Review not found');
    return this.toPublicReview(review);
  }

  async updateReply(
    id: string,
    dto: UpdateProductReviewReplyDto,
    actor: ReviewActor,
  ) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!review) throw new NotFoundException('Review not found');
    if (
      actor.role === 'seller' &&
      review.product.shop_id !== (await this.findSellerShopId(actor.userId))
    ) {
      throw new NotFoundException('Review not found');
    }

    review.shop_reply = dto.shop_reply.trim() || null;
    review.shop_replied_at = review.shop_reply ? new Date() : null;
    return this.reviewRepo.save(review);
  }

  async remove(id: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.manager.transaction(async (manager) => {
      await manager.getRepository(ProductReview).delete(id);
      await this.refreshProductRating(manager, review.product_id);
    });
    return { success: true, id };
  }

  private async refreshProductRating(
    manager: EntityManager,
    productId: string,
  ) {
    const result = await manager
      .getRepository(ProductReview)
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'average')
      .where('review.product_id = :productId', { productId })
      .getRawOne<{ count: string; average: string | null }>();

    await manager.getRepository(Product).update(productId, {
      rating_count: Number(result?.count ?? 0),
      rating_avg: Number(result?.average ?? 0),
    });
  }

  private async findSellerShopId(userId: number) {
    const shop = await this.shopRepo.findOne({
      where: { user: { id: String(userId) } },
      select: ['id'],
    });
    if (!shop) throw new ForbiddenException('Seller has no shop');
    return shop.id;
  }

  private toPublicReview(review: ProductReview) {
    return {
      id: review.id,
      product_id: review.product_id,
      rating: review.rating,
      comment: review.comment,
      media_urls: review.media_urls ?? [],
      shop_reply: review.shop_reply,
      shop_replied_at: review.shop_replied_at,
      created_at: review.created_at,
      user: review.user
        ? {
            name: review.user.name,
            avatar: review.user.avatar,
          }
        : undefined,
      product: review.product
        ? { id: review.product.id, name: review.product.name }
        : undefined,
    };
  }
}
