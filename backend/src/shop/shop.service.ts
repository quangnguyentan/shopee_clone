// shop/shop.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PaginationDto } from '@/base/base.dto';

@Injectable()
export class ShopService extends BaseService<Shop> {
  constructor(
    @InjectRepository(Shop)
    repo: Repository<Shop>,
  ) {
    super(repo);
  }

  async findAll(query?: PaginationDto) {
    return super.findAll(query, {
      relations: ['user', 'products'],
    });
  }
  async findOneById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'products'],
    });
  }

  async createShop(userId: number, dto: CreateShopDto) {
    const existed = await this.repo.findOne({
      where: { user: { id: userId } } as any,
    });

    if (existed) {
      throw new ForbiddenException('User already has a shop');
    }

    return this.create({
      ...dto,
      user: { id: userId } as any,
    });
  }

  async updateShop(shopId: number, userId: number, dto: UpdateShopDto) {
    const shop = await this.repo.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) throw new NotFoundException('Shop not found');

    if (shop.user.id !== userId) {
      throw new ForbiddenException('Not shop owner');
    }

    return this.updateById(shopId, dto);
  }

  async deleteShop(shopId: number, userId: number) {
    const shop = await this.repo.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) throw new NotFoundException('Shop not found');

    if (shop.user.id !== userId) {
      throw new ForbiddenException('Not shop owner');
    }

    return this.deleteById(shopId);
  }
}
