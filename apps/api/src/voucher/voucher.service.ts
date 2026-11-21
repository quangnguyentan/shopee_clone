import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '@/base/base.dto';
import { VoucherScope } from '@/common/enums/marketplace.enums';
import { Shop } from '@/shop/entities/shop.entity';
import { Voucher } from './entities/voucher.entity';
import { VoucherRedemption } from './entities/voucher-redemption.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

type VoucherManager = { userId: number; role: 'admin' | 'seller' };

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
    @InjectRepository(VoucherRedemption)
    private readonly redemptionRepo: Repository<VoucherRedemption>,
  ) {}

  async create(dto: CreateVoucherDto, actor: VoucherManager) {
    const code = dto.code.trim().toUpperCase();
    if (await this.voucherRepo.findOne({ where: { code } })) {
      throw new ConflictException('Voucher code already exists');
    }

    this.validateDiscount(dto.discount_type, dto.discount_value);
    this.validateDates(dto.starts_at, dto.expired_at);
    const shopId = await this.resolveShopId(actor, dto.scope, dto.shop_id);

    const voucher = this.voucherRepo.create({
      code,
      scope: dto.scope,
      shop_id: shopId,
      discount_type: dto.discount_type,
      discount_value: String(dto.discount_value),
      starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
      expired_at: new Date(dto.expired_at),
      min_order_amount: String(dto.min_order_amount ?? 0),
      max_discount:
        dto.max_discount == null ? null : String(dto.max_discount),
      usage_limit: dto.usage_limit ?? null,
      per_user_limit: dto.per_user_limit ?? null,
    });

    return this.voucherRepo.save(voucher);
  }

  async findAll(actor: VoucherManager, query: PaginationDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 100);
    const where =
      actor.role === 'seller'
        ? { shop_id: await this.findSellerShopId(actor.userId) }
        : undefined;
    const [items, total] = await this.voucherRepo.findAndCount({
      where,
      relations: ['shop'],
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: string, actor: VoucherManager) {
    const voucher = await this.voucherRepo.findOne({
      where: { id },
      relations: ['shop'],
    });
    if (!voucher) throw new NotFoundException('Voucher not found');
    if (
      actor.role === 'seller' &&
      voucher.shop_id !== (await this.findSellerShopId(actor.userId))
    ) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto, actor: VoucherManager) {
    const voucher = await this.findOne(id, actor);
    const scope = dto.scope ?? voucher.scope;
    const shopId = await this.resolveShopId(
      actor,
      scope,
      dto.shop_id ?? (scope === voucher.scope ? voucher.shop_id : undefined),
    );
    const discountType = dto.discount_type ?? voucher.discount_type;
    const discountValue =
      dto.discount_value ?? Number(voucher.discount_value);
    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const existing = await this.voucherRepo.findOne({ where: { code } });
      if (existing && existing.id !== voucher.id) {
        throw new ConflictException('Voucher code already exists');
      }
    }
    this.validateDiscount(discountType, discountValue);
    this.validateDates(
      dto.starts_at ?? voucher.starts_at?.toISOString(),
      dto.expired_at ?? voucher.expired_at.toISOString(),
    );

    Object.assign(voucher, {
      ...dto,
      code: dto.code?.trim().toUpperCase() ?? voucher.code,
      scope,
      shop_id: shopId,
      discount_value: String(discountValue),
      min_order_amount:
        dto.min_order_amount === undefined
          ? voucher.min_order_amount
          : String(dto.min_order_amount),
      max_discount:
        dto.max_discount === undefined
          ? voucher.max_discount
          : dto.max_discount == null
            ? null
            : String(dto.max_discount),
      starts_at:
        dto.starts_at === undefined
          ? voucher.starts_at
          : new Date(dto.starts_at),
      expired_at:
        dto.expired_at === undefined
          ? voucher.expired_at
          : new Date(dto.expired_at),
    });
    return this.voucherRepo.save(voucher);
  }

  async remove(id: string, actor: VoucherManager) {
    const voucher = await this.findOne(id, actor);
    const redemptionCount = await this.redemptionRepo.count({
      where: { voucher_id: id },
    });
    if (voucher.usage_count > 0 || redemptionCount > 0) {
      throw new ConflictException(
        'A redeemed voucher cannot be deleted; deactivate it instead.',
      );
    }
    await this.voucherRepo.delete(id);
    return { success: true, id };
  }

  private validateDiscount(type: 'percent' | 'fixed', value: number) {
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      (type === 'percent' && value > 100)
    ) {
      throw new BadRequestException('Invalid voucher discount value');
    }
  }

  private validateDates(startsAt?: string, expiresAt?: string) {
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      throw new BadRequestException(
        'Voucher expiry must be after its start date',
      );
    }
  }

  private async resolveShopId(
    actor: VoucherManager,
    scope: VoucherScope,
    requestedShopId?: string | null,
  ) {
    if (actor.role === 'seller') {
      if (scope !== VoucherScope.SHOP) {
        throw new ForbiddenException('Sellers can only manage shop vouchers');
      }
      return this.findSellerShopId(actor.userId);
    }

    if (scope !== VoucherScope.SHOP) return null;
    if (!requestedShopId) {
      throw new BadRequestException('Shop vouchers require a shop');
    }

    const shop = await this.shopRepo.findOne({
      where: { id: String(requestedShopId) },
      select: ['id'],
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop.id;
  }

  private async findSellerShopId(userId: number) {
    const shop = await this.shopRepo.findOne({
      where: { user: { id: String(userId) } },
      select: ['id'],
    });
    if (!shop) throw new ForbiddenException('Seller has no shop');
    return shop.id;
  }
}
