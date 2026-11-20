import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CartRecommendationsDto } from './dto/cart-recommendations.dto';
import { KeywordRecommendationQueryDto } from './dto/keyword-recommendation-query.dto';
import { RecommendationClient } from './recommendation.client';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendations: RecommendationClient) {}

  @Post('cart')
  getCartRecommendations(@Body() dto: CartRecommendationsDto) {
    return this.recommendations.getCartRecommendations(dto.product_ids);
  }

  @Get('keyword')
  getKeywordRecommendations(@Query() query: KeywordRecommendationQueryDto) {
    return this.recommendations.getKeywordRecommendations(query.q, query.limit);
  }
}
