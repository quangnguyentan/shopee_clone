import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { ProductImage } from './entities/product-image.entity';
import { Product } from 'src/product/entities/product.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { PaginationDto } from '@/base/base.dto';

@Injectable()
export class ProductImageService extends BaseService<ProductImage> {
  constructor(
    @InjectRepository(ProductImage)
    repo: Repository<ProductImage>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {
    super(repo);
  }

  async findAll(query?: PaginationDto) {
    return super.findAll(query, {
      relations: ['product'],
    });
  }

  async findOneById(id: number) {
    const image = await this.repo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    return image;
  }

  async createImage(dto: {
    product_id: number;
    url: string;
    is_primary?: boolean;
  }) {
    const product = await this.productRepo.findOne({
      where: { id: dto.product_id },
    });

    if (!product) throw new NotFoundException('Product not found');

    // nếu set primary → reset ảnh cũ
    if (dto.is_primary) {
      await this.repo.update({ product: { id: dto.product_id } } as any, {
        is_primary: false,
      });
    }

    return this.create({
      url: dto.url,
      is_primary: dto.is_primary ?? false,
      product,
    });
  }

  findByProduct(productId: number) {
    return this.repo.find({
      where: { product: { id: productId } } as any,
      order: { is_primary: 'DESC', id: 'ASC' },
    });
  }

  async setPrimary(imageId: number) {
    const image = await this.repo.findOne({
      where: { id: imageId },
      relations: ['product'],
    });

    if (!image) throw new NotFoundException('Image not found');

    await this.repo.update({ product: { id: image.product.id } } as any, {
      is_primary: false,
    });

    image.is_primary = true;
    return this.repo.save(image);
  }
  async deleteImage(imageId: number) {
    const image = await this.repo.findOne({
      where: { id: imageId },
      relations: ['product'],
    });

    if (!image) throw new NotFoundException('Image not found');

    await this.repo.remove(image);

    await this.deleteFileSafe(image.url);

    return { success: true };
  }

  private async deleteFileSafe(url: string) {
    try {
      const filePath = join(process.cwd(), 'public', url);
      await unlink(filePath);
    } catch (err) {
      console.warn('Delete file failed:', err.message);
    }
  }
}
