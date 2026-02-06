import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';
import { FlashSale } from '@/flash-sale/entities/flash-sale.entity';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';

@Injectable()
export class FlashSaleItemService {
  constructor(
    @InjectRepository(FlashSaleItem)
    private readonly flashSaleItemRepo: Repository<FlashSaleItem>,

    @InjectRepository(FlashSale)
    private readonly flashSaleRepo: Repository<FlashSale>,
  ) {}

  async create(dto: CreateFlashSaleItemDto) {
    const sale = await this.flashSaleRepo.findOne({
      where: { id: dto.flash_sale_id },
    });

    if (!sale) {
      throw new BadRequestException('Flash sale not found');
    }

    const exists = await this.flashSaleItemRepo.findOne({
      where: {
        flash_sale_id: dto.flash_sale_id,
        product_variant_id: dto.product_variant_id,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Product variant already exists in this flash sale',
      );
    }

    return this.flashSaleItemRepo.save(dto);
  }

  findAll() {
    return this.flashSaleItemRepo.find({
      relations: [
        'flash_sale',
        'product_variant',
        'product_variant.product',
        'product_variant.product.images',
      ],
      order: { id: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.flashSaleItemRepo.findOne({
      where: { id },
      relations: [
        'flash_sale',
        'product_variant',
        'product_variant.product',
        'product_variant.product.images',
      ],
    });
  }

  async update(id: number, dto: UpdateFlashSaleItemDto) {
    const item = await this.flashSaleItemRepo.findOne({ where: { id } });

    if (!item) {
      throw new BadRequestException('Flash sale item not found');
    }

    await this.flashSaleItemRepo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.flashSaleItemRepo.delete(id);
  }

  findByFlashSale(flashSaleId: number) {
    return this.flashSaleItemRepo.find({
      where: {
        flash_sale_id: flashSaleId,
        is_active: true,
      },
      relations: [
        'product_variant',
        'product_variant.product',
        'product_variant.product.images',
      ],
      order: { sold: 'DESC' },
    });
  }
}
