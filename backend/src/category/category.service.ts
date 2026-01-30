import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/base/base.dto';

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
        where: { id: dto.parent_id },
      });

      if (!parent) throw new NotFoundException('Parent category not found');
    }

    return this.create({
      name: dto.name,
      imageUrl: dto.imageUrl,
      parent,
    });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    if (dto.parent_id) {
      const parent = await this.repo.findOne({
        where: { id: dto.parent_id },
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
      where: { id },
      relations: ['children', 'attributes', 'parent'],
    });
  }
}
