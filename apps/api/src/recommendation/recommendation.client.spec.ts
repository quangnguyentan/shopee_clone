import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { RecommendationClient } from './recommendation.client';
import { ProductRecommendation } from './types/product-recommendation.type';

describe('RecommendationClient', () => {
  const recommendations: ProductRecommendation[] = [
    { product_id: 7, product_name: 'Sample product', score: 0.8 },
  ];
  let client: RecommendationClient;
  let http: { get: jest.Mock; post: jest.Mock };

  beforeEach(() => {
    http = {
      get: jest.fn(),
      post: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) =>
        key === 'RECOMMENDATION_CACHE_TTL_SECONDS' ? 60 : undefined,
      ),
    };
    client = new RecommendationClient(
      http as unknown as HttpService,
      config as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('caches successful home recommendations per user', async () => {
    http.get.mockReturnValue(of({ data: recommendations }));

    await expect(client.getUserRecommendations(42)).resolves.toEqual(
      recommendations,
    );
    await expect(client.getUserRecommendations(42)).resolves.toEqual(
      recommendations,
    );

    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when the recommendation service is unavailable', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    http.get.mockReturnValue(throwError(() => new Error('connection timeout')));

    await expect(client.getUserRecommendations(42)).resolves.toEqual([]);
    expect(http.get).toHaveBeenCalledTimes(1);
  });
});
