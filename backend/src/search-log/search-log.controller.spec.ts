import { Test, TestingModule } from '@nestjs/testing';
import { SearchLogController } from './search-log.controller';
import { SearchLogService } from './search-log.service';

describe('SearchLogController', () => {
  let controller: SearchLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchLogController],
      providers: [SearchLogService],
    }).compile();

    controller = module.get<SearchLogController>(SearchLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
