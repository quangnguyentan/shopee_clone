jest.mock('./product.service', () => ({
  ProductService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { RecommendationClient } from '@/recommendation/recommendation.client';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: {} },
        {
          provide: RecommendationClient,
          useValue: { getSimilarProducts: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
