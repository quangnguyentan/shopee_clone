import { Module } from '@nestjs/common';
import { ShopFollowService } from './shop-follow.service';
import { ShopFollowController } from './shop-follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopFollow } from './entities/shop-follow.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopFollow, Shop, Session])],
  controllers: [ShopFollowController],
  providers: [ShopFollowService],
})
export class ShopFollowModule {}
