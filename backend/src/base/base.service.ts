import { Repository, DeepPartial, FindManyOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { PaginationDto } from './base.dto';

export class BaseService<T extends BaseEntity> {
  constructor(protected readonly repo: Repository<T>) {}

  async create(data: DeepPartial<T>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(
    query?: PaginationDto,
    options?: Omit<FindManyOptions<T>, 'take' | 'skip'>,
  ) {
    console.log(query, 'query');
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.repo.findAndCount({
      take: limit,
      skip,
      order: { id: 'ASC' } as any,
      ...options,
    });

    return { items, total, page, limit };
  }

  findOneById(id: number) {
    return this.repo.findOneBy({ id } as any);
  }

  async updateById(id: number, data: QueryDeepPartialEntity<T>) {
    await this.repo.update(id, data);
    return this.findOneById(id);
  }

  deleteById(id: number) {
    return this.repo.delete(id);
  }
}
