import { Test, TestingModule } from '@nestjs/testing';
import { VariantOptionService } from './variant-option.service';

describe('VariantOptionService', () => {
  let service: VariantOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariantOptionService],
    }).compile();

    service = module.get<VariantOptionService>(VariantOptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
