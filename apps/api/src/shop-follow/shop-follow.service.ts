import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '@/shop/entities/shop.entity';
import { ShopFollow } from './entities/shop-follow.entity';

@Injectable()
export class ShopFollowService {
  constructor(
    @InjectRepository(ShopFollow)
    private readonly follows: Repository<ShopFollow>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
  ) {}

  async getFollowerCount(shopId: string) {
    await this.assertShopExists(shopId);
    return { follower_count: await this.follows.countBy({ shop_id: Number(shopId) }) };
  }

  async getStatus(shopId: string, userId: number) {
    await this.assertShopExists(shopId);
    const [isFollowing, followerCount] = await Promise.all([
      this.follows.exist({
        where: { shop_id: Number(shopId), user_id: userId },
      }),
      this.follows.countBy({ shop_id: Number(shopId) }),
    ]);
    return { is_following: isFollowing, follower_count: followerCount };
  }

  async follow(shopId: string, userId: number) {
    await this.assertShopExists(shopId);
    await this.follows
      .createQueryBuilder()
      .insert()
      .values({ shop_id: Number(shopId), user_id: userId })
      .orIgnore()
      .execute();
    return this.getStatus(shopId, userId);
  }

  async unfollow(shopId: string, userId: number) {
    await this.assertShopExists(shopId);
    await this.follows.delete({
      shop_id: Number(shopId),
      user_id: userId,
    });
    return this.getStatus(shopId, userId);
  }

  private async assertShopExists(shopId: string) {
    const shop = await this.shops.findOne({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
  }
}
