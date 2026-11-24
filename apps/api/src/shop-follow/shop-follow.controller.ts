import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ShopFollowService } from './shop-follow.service';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiAuthenticated,
  ApiControllerDocs,
} from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Shop Follows')
@Controller('shop-follow')
export class ShopFollowController {
  constructor(private readonly shopFollowService: ShopFollowService) {}

  @Get(':shopId/count')
  getFollowerCount(@Param('shopId') shopId: string) {
    return this.shopFollowService.getFollowerCount(shopId);
  }

  @AuthRole('buyer')
  @ApiAuthenticated()
  @Get(':shopId/status')
  getStatus(
    @Param('shopId') shopId: string,
    @CurrentUser() user: { userId: number },
  ) {
    return this.shopFollowService.getStatus(shopId, user.userId);
  }

  @AuthRole('buyer')
  @ApiAuthenticated()
  @Post(':shopId')
  follow(
    @Param('shopId') shopId: string,
    @CurrentUser() user: { userId: number },
  ) {
    return this.shopFollowService.follow(shopId, user.userId);
  }

  @AuthRole('buyer')
  @ApiAuthenticated()
  @Delete(':shopId')
  unfollow(
    @Param('shopId') shopId: string,
    @CurrentUser() user: { userId: number },
  ) {
    return this.shopFollowService.unfollow(shopId, user.userId);
  }
}
