import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { SearchLog } from './entities/search-log.entity';
import { CreateSearchLogDto } from './dto/create-search-log.dto';

@Injectable()
export class SearchLogService {
  constructor(
    @InjectRepository(SearchLog)
    private readonly repo: Repository<SearchLog>,
  ) {}

  // 🔥 Ghi log search keyword
  async create(dto: CreateSearchLogDto) {
    const keyword = dto.keyword?.trim().toLowerCase();
    if (!keyword) return;

    await this.repo.insert({
      keyword,
      product_id: null,
    });

    return { success: true };
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  // 🔥 Top keyword hôm nay
  getTodayTopSearch(limit = 10) {
    return this.repo.manager.query(
      `
      SELECT keyword, COUNT(*)::int AS count
      FROM search_logs
      WHERE created_at::date = CURRENT_DATE
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT $1
      `,
      [limit],
    );
  }

  // 🔥 Suggest keyword
  suggest(keyword: string, limit = 10) {
    return this.repo.manager.query(
      `
      SELECT keyword, COUNT(*)::int AS count
      FROM search_logs
      WHERE keyword ILIKE $1
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT $2
      `,
      [`${keyword}%`, limit],
    );
  }
}
