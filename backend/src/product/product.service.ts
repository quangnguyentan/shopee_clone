import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    repo: Repository<Product>,
  ) {
    super(repo);
  }

  async createProduct(userId: number, dto: CreateProductDto) {
    return this.create({
      ...dto,
      shop: { id: dto.shop_id } as any,
    });
  }

  async updateProduct(
    productId: number,
    userId: number,
    dto: UpdateProductDto,
  ) {
    return this.updateById(productId, dto);
  }

  async deleteProduct(productId: number, userId: number) {
    return this.deleteById(productId);
  }

  findByShop(shopId: number) {
    return this.repo.find({
      where: { shop: { id: shopId } },
      relations: ['images'],
      order: { id: 'DESC' },
    });
  }
}
