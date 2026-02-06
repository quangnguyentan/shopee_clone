import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlashSale } from './entities/flash-sale.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { FlashSaleItem } from '@/flash-sale-item/entities/flash-sale-item.entity';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { AddFlashSaleItemDto } from './dto/add-flash-sale.dto';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';

@Injectable()
export class FlashSaleService {
  constructor(
    @InjectRepository(FlashSale)
    private flashSaleRepo: Repository<FlashSale>,

    @InjectRepository(FlashSaleItem)
    private flashSaleItemRepo: Repository<FlashSaleItem>,

    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateFlashSaleDto) {
    if (new Date(dto.start_time) >= new Date(dto.end_time)) {
      throw new BadRequestException('start_time must be before end_time');
    }

    return this.flashSaleRepo.save({
      ...dto,
      is_active: true,
    });
  }

  findAll() {
    return this.flashSaleRepo.find({
      relations: ['items'],
      order: { priority: 'DESC', id: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.flashSaleRepo.findOne({
      where: { id },
      relations: [
        'items',
        'items.product_variant',
        'items.product_variant.product',
      ],
    });
  }

  update(id: number, dto: UpdateFlashSaleDto) {
    return this.flashSaleRepo.update(id, dto);
  }

  remove(id: number) {
    return this.flashSaleRepo.delete(id);
  }

  async getActiveFlashSale() {
    const now = new Date();

    const sale = await this.flashSaleRepo.findOne({
      where: {
        is_active: true,
        start_time: LessThanOrEqual(now),
        end_time: MoreThanOrEqual(now),
      },
      order: { priority: 'DESC' },
      relations: [
        'items',
        'items.product_variant',
        'items.product_variant.product',
        'items.product_variant.product.images',
      ],
    });

    if (!sale) return null;

    return {
      id: sale.id,
      name: sale.name,
      start_time: sale.start_time,
      end_time: sale.end_time,
      server_time: now,
      countdown: sale.end_time.getTime() - now.getTime(),
      items: sale.items,
    };
  }

  async addItem(flashSaleId: number, dto: AddFlashSaleItemDto) {
    const sale = await this.flashSaleRepo.findOne({
      where: { id: flashSaleId },
    });
    if (!sale) throw new NotFoundException('Flash sale not found');

    const variant = await this.variantRepo.findOne({
      where: { id: dto.product_variant_id },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    if (dto.flash_price >= Number(variant.price)) {
      throw new BadRequestException(
        'Flash price must be less than original price',
      );
    }

    const discountPercent = Math.round(
      ((Number(variant.price) - dto.flash_price) / Number(variant.price)) * 100,
    );

    return this.flashSaleItemRepo.save({
      flash_sale_id: flashSaleId,
      product_variant_id: dto.product_variant_id,
      flash_price: dto.flash_price,
      discount_percent: discountPercent,
      stock: dto.stock,
      sold: 0,
      is_active: true,
    });
  }

  removeItem(id: number) {
    return this.flashSaleItemRepo.delete(id);
  }
}
