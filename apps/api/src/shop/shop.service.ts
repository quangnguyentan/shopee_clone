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
import { slugify } from '@/common/utils/slug.util';
import { User } from '@/user/entities/user.entity';
import { Product } from '@/product/entities/product.entity';

@Injectable()
export class ShopService extends BaseService<Shop> {
  constructor(
    @InjectRepository(Shop)
    repo: Repository<Shop>,
  ) {
    super(repo);
  }

  async findAllShops(query?: PaginationDto) {
    const result = await super.findAll(query, {
      relations: ['user', 'products'],
    });
    return { ...result, items: result.items.map((shop) => this.toSafeShop(shop)) };
  }

  async findForViewer(
    query: PaginationDto,
    user?: { userId: number; role: string },
  ) {
    if (user?.role !== 'seller') return this.findAllShops(query);

    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 100);
    const [items, total] = await this.repo.findAndCount({
      where: { user: { id: String(user.userId) } },
      relations: ['user', 'products'],
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'ASC' },
    });
    return {
      items: items.map((shop) => this.toSafeShop(shop)),
      total,
      page,
      limit,
    };
  }

  async findOneForViewer(
    id: string,
    user?: { userId: number; role: string },
  ) {
    const shop = await this.repo.findOne({
      where: { id },
      relations: ['user', 'products'],
    });
    if (!shop) throw new NotFoundException('Shop not found');
    if (user?.role === 'seller' && shop.user.id !== String(user.userId)) {
      throw new ForbiddenException('No permission to access this shop');
    }
    return this.toSafeShop(shop);
  }

  private toSafeShop(shop: Shop) {
    if (!shop.user) return shop;
    return {
      ...shop,
      user: {
        id: shop.user.id,
        name: shop.user.name,
        email: shop.user.email,
      },
    };
  }

  async findOneById(id: number) {
    return this.repo.findOne({
      where: { id: String(id) },
      relations: ['user', 'products'],
    });
  }

  async createShop(dto: CreateShopDto) {
    const owner = await this.repo.manager.findOne(User, {
      where: { id: String(dto.user_id) },
    });
    if (!owner || owner.role !== 'seller') {
      throw new NotFoundException('Seller account not found');
    }

    const existed = await this.repo.findOne({
      where: { user: { id: String(dto.user_id) } } as any,
    });

    if (existed) {
      throw new ForbiddenException('User already has a shop');
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
      description: dto.description,
      logo: dto.logo,
      rating: dto.rating ?? 0,
      is_active: dto.is_active ?? true,
      user: { id: String(dto.user_id) } as any,
    });
  }

  async updateShop(
    shopId: string,
    user: { userId: number; role: string },
    dto: UpdateShopDto,
  ) {
    const shop = await this.repo.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) throw new NotFoundException('Shop not found');

    const isAdmin = user.role === 'admin';
    const isOwner = shop.user.id === String(user.userId);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('No permission');
    }

    if (isAdmin && dto.user_id !== undefined) {
      const owner = await this.repo.manager.findOne(User, {
        where: { id: String(dto.user_id) },
      });
      if (!owner || owner.role !== 'seller') {
        throw new NotFoundException('Seller account not found');
      }
      shop.user = owner;
    } else if (!isAdmin && dto.user_id !== undefined) {
      throw new ForbiddenException('Only admins can transfer shop ownership');
    }

    if (isAdmin) {
      const { user_id: _userId, ...adminFields } = dto;
      Object.assign(shop, adminFields);
    } else {
      Object.assign(shop, {
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
      });
    }
    return this.repo.save(shop);
  }

  async deleteShop(
    shopId: string,
    user: { userId: number; role: string },
  ) {
    const shop = await this.repo.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) throw new NotFoundException('Shop not found');

    if (user.role !== 'admin' && shop.user.id !== String(user.userId)) {
      throw new ForbiddenException('Not shop owner');
    }

    await this.repo.manager.transaction(async (manager) => {
      await manager.update(
        Product,
        { shop_id: shop.id },
        { status: 'inactive', is_active: false },
      );
      await manager.softDelete(Shop, shopId);
    });
    return { success: true, id: shopId };
  }

  async getShopeeMallActive(limit = 16) {
    return this.repo.find({
      where: {
        is_mall: true,
        is_active: true,
      },
      order: {
        created_at: 'DESC',
      },
      take: limit,
    });
  }
}
