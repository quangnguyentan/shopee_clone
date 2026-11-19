import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ProductRecommendation } from './types/product-recommendation.type';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';

interface CacheEntry {
  expiresAt: number;
  recommendations: ProductRecommendation[];
}

@Injectable()
export class RecommendationClient {
  private readonly logger = new Logger(RecommendationClient.name);
  private readonly discoverCache = new Map<number, CacheEntry>();
  private readonly discoverRequests = new Map<
    number,
    Promise<ProductRecommendation[]>
  >();
  private readonly cacheTtlMs: number;
  private readonly maxCacheEntries = 500;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    const cacheTtlSeconds = Number(
      config.get('RECOMMENDATION_CACHE_TTL_SECONDS') ?? 60,
    );
    if (!Number.isFinite(cacheTtlSeconds) || cacheTtlSeconds < 0) {
      throw new Error('RECOMMENDATION_CACHE_TTL_SECONDS must be non-negative');
    }
    this.cacheTtlMs = cacheTtlSeconds * 1000;
  }

  async getSimilarProducts(
    productId: number,
    filters: RecommendationFilterDto = {},
  ): Promise<ProductRecommendation[]> {
    const recommendations = await this.requestRecommendations(
      `similar products for product ${productId}`,
      () =>
        firstValueFrom(
          this.http.get<ProductRecommendation[]>(`/recommend/${productId}`, {
            params: {
              min_price: filters.min_price,
              max_price: filters.max_price,
              exclude_same_shop: filters.exclude_same_shop,
              limit: 10,
            },
          }),
        ),
    );
    return recommendations ?? [];
  }

  async getCartRecommendations(
    productIds: number[],
  ): Promise<ProductRecommendation[]> {
    const recommendations = await this.requestRecommendations(
      'cart recommendations',
      () =>
        firstValueFrom(
          this.http.post<ProductRecommendation[]>('/recommend/cart', {
            product_ids: productIds,
          }),
        ),
    );
    return recommendations ?? [];
  }

  async getKeywordRecommendations(
    keyword: string,
    limit = 10,
  ): Promise<ProductRecommendation[]> {
    const recommendations = await this.requestRecommendations(
      'keyword recommendations',
      () =>
        firstValueFrom(
          this.http.get<ProductRecommendation[]>('/recommend/keyword', {
            params: { q: keyword, limit },
          }),
        ),
    );
    return recommendations ?? [];
  }

  async getUserRecommendations(
    userId: number,
  ): Promise<ProductRecommendation[]> {
    const cached = this.getCachedDiscover(userId);
    if (cached) return cached;

    const inFlight = this.discoverRequests.get(userId);
    if (inFlight) return inFlight;

    const request = this.loadUserRecommendations(userId);
    this.discoverRequests.set(userId, request);
    try {
      return await request;
    } finally {
      this.discoverRequests.delete(userId);
    }
  }

  private async loadUserRecommendations(
    userId: number,
  ): Promise<ProductRecommendation[]> {
    const recommendations = await this.requestRecommendations(
      `discover recommendations for user ${userId}`,
      () =>
        firstValueFrom(
          this.http.get<ProductRecommendation[]>(`/recommend/user/${userId}`),
        ),
    );
    if (!recommendations) return [];

    this.setCachedDiscover(userId, recommendations);
    return recommendations;
  }

  private getCachedDiscover(userId: number): ProductRecommendation[] | null {
    const entry = this.discoverCache.get(userId);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.discoverCache.delete(userId);
      return null;
    }
    return entry.recommendations;
  }

  private setCachedDiscover(
    userId: number,
    recommendations: ProductRecommendation[],
  ): void {
    if (this.cacheTtlMs === 0) return;

    for (const [cachedUserId, entry] of this.discoverCache) {
      if (entry.expiresAt <= Date.now()) {
        this.discoverCache.delete(cachedUserId);
      }
    }
    if (
      !this.discoverCache.has(userId) &&
      this.discoverCache.size >= this.maxCacheEntries
    ) {
      const oldestUserId = this.discoverCache.keys().next().value;
      if (oldestUserId !== undefined) this.discoverCache.delete(oldestUserId);
    }
    this.discoverCache.set(userId, {
      expiresAt: Date.now() + this.cacheTtlMs,
      recommendations,
    });
  }

  private async requestRecommendations(
    context: string,
    request: () => Promise<AxiosResponse<ProductRecommendation[]>>,
  ): Promise<ProductRecommendation[] | null> {
    try {
      const response = await request();
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
      this.logger.warn(
        `Recommendation service failed (${context}): ${message}`,
      );
      return null;
    }
  }
}
