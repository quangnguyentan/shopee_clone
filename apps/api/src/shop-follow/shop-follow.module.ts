import { Module } from '@nestjs/common';
import { ShopFollowService } from './shop-follow.service';
import { ShopFollowController } from './shop-follow.controller';

@Module({
  controllers: [ShopFollowController],
  providers: [ShopFollowService],
})
export class ShopFollowModule {}
