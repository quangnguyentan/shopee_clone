import { Test, TestingModule } from '@nestjs/testing';
import { SearchLogService } from './search-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchLog } from './entities/search-log.entity';

describe('SearchLogService', () => {
  let service: SearchLogService;
  const searchLogRepository = {
    insert: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchLogService,
        {
          provide: getRepositoryToken(SearchLog),
          useValue: searchLogRepository,
        },
      ],
    }).compile();

    service = module.get<SearchLogService>(SearchLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stores the authenticated user id on the search log', async () => {
    await service.create({ keyword: '  Điện Thoại  ' }, 42);

    expect(searchLogRepository.insert).toHaveBeenCalledWith({
      keyword: 'điện thoại',
      product_id: null,
      user_id: 42,
    });
  });

  it('stores anonymous searches with a null user id', async () => {
    await service.create({ keyword: 'Tai nghe' });

    expect(searchLogRepository.insert).toHaveBeenCalledWith({
      keyword: 'tai nghe',
      product_id: null,
      user_id: null,
    });
  });
});
