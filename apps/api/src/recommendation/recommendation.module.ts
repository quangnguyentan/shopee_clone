import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '@/session/entities/session.entity';
import { HomeController } from './home.controller';
import { RecommendationController } from './recommendation.controller';
import { RecommendationClient } from './recommendation.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const timeout = Number(
          config.get('RECOMMENDATION_SERVICE_TIMEOUT_MS') ?? 3000,
        );
        if (!Number.isFinite(timeout) || timeout <= 0) {
          throw new Error(
            'RECOMMENDATION_SERVICE_TIMEOUT_MS must be greater than zero',
          );
        }

        return {
          baseURL:
            config.get<string>('RECOMMENDATION_SERVICE_URL') ??
            'http://127.0.0.1:8000',
          timeout,
        };
      },
    }),
  ],
  controllers: [HomeController, RecommendationController],
  providers: [RecommendationClient],
  exports: [RecommendationClient],
})
export class RecommendationModule {}
