import { Controller, Get } from '@nestjs/common';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RecommendationClient } from './recommendation.client';
import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Home')
@Auth()
@Controller('home')
export class HomeController {
  constructor(private readonly recommendations: RecommendationClient) {}

  @Get('discover')
  @ApiAuthenticated()
  discover(@CurrentUser() user: { userId: number }) {
    return this.recommendations.getUserRecommendations(user.userId);
  }
}
