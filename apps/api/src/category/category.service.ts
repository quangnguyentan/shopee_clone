import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/base/base.dto';
import { slugify } from '@/common/utils/slug.util';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    repo: Repository<Category>,
  ) {
    super(repo);
  }

  async createCategory(dto: CreateCategoryDto) {
    let parent;

    if (dto.parent_id) {
      parent = await this.repo.findOne({
        where: { id: String(dto.parent_id) },
      });

      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let suffix = 2;
    while (await this.repo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    return this.create({
      name: dto.name,
      slug,
      imageUrl: dto.imageUrl,
      parent,
    });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    if (dto.parent_id) {
      const parent = await this.repo.findOne({
        where: { id: String(dto.parent_id) },
      });

      if (!parent) throw new NotFoundException('Parent category not found');

      return this.updateById(id, {
        name: dto.name,
        parent,
        imageUrl: dto.imageUrl,
      } as any);
    }

    return this.updateById(id, dto);
  }

  findAllTree() {
    return this.repo.find({
      where: { parent: IsNull() },
      relations: ['children'],
      order: { id: 'ASC' },
    });
  }

  findChildren(parentId: number) {
    return this.repo.find({
      where: { parent: { id: parentId } } as any,
      relations: ['children'],
    });
  }

  findAll(query?: PaginationDto) {
    return super.findAll(query, {
      relations: ['children', 'attributes', 'parent'],
    });
  }
  async findOneById(id: number) {
    return this.repo.findOne({
      where: { id: String(id) },
      relations: ['children', 'attributes', 'parent'],
    });
  }
}
