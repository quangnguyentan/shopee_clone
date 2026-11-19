import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationClient } from './recommendation.client';

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let recommendations: {
    getCartRecommendations: jest.Mock;
    getKeywordRecommendations: jest.Mock;
  };

  beforeEach(async () => {
    recommendations = {
      getCartRecommendations: jest.fn().mockResolvedValue([]),
      getKeywordRecommendations: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [{ provide: RecommendationClient, useValue: recommendations }],
    }).compile();

    controller = module.get<RecommendationController>(RecommendationController);
  });

  it('forwards cart product IDs to the recommendation client', async () => {
    await controller.getCartRecommendations({ product_ids: [1, 2] });

    expect(recommendations.getCartRecommendations).toHaveBeenCalledWith([1, 2]);
  });

  it('forwards keyword and limit to the recommendation client', async () => {
    await controller.getKeywordRecommendations({ q: 'phone', limit: 5 });

    expect(recommendations.getKeywordRecommendations).toHaveBeenCalledWith(
      'phone',
      5,
    );
  });
});
