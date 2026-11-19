import { Controller, Get } from '@nestjs/common';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RecommendationClient } from './recommendation.client';

@Auth()
@Controller('home')
export class HomeController {
  constructor(private readonly recommendations: RecommendationClient) {}

  @Get('discover')
  discover(@CurrentUser() user: { userId: number }) {
    return this.recommendations.getUserRecommendations(user.userId);
  }
}
