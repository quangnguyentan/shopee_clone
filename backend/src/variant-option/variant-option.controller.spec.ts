import { Test, TestingModule } from '@nestjs/testing';
import { VariantOptionController } from './variant-option.controller';
import { VariantOptionService } from './variant-option.service';

describe('VariantOptionController', () => {
  let controller: VariantOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantOptionController],
      providers: [VariantOptionService],
    }).compile();

    controller = module.get<VariantOptionController>(VariantOptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
