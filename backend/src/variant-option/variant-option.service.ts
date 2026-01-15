// variant-option/variant-option.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { VariantOption } from './entities/variant-option.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { UpdateVariantOptionDto } from './dto/update-variant-option.dto';
import { CreateVariantOptionWithVariantDto } from './dto/create-variant-option-with-variant.dto';

@Injectable()
export class VariantOptionService extends BaseService<VariantOption> {
  constructor(
    @InjectRepository(VariantOption)
    repo: Repository<VariantOption>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {
    super(repo);
  }

  async createOption(dto: CreateVariantOptionWithVariantDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variant_id },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.create({
      option_name: dto.option_name,
      option_value: dto.option_value,
      variant,
    });
  }

  findByVariant(variantId: number) {
    return this.repo.find({
      where: { variant: { id: variantId } } as any,
      relations: ['variant'],
    });
  }

  updateOption(id: number, dto: UpdateVariantOptionDto) {
    return this.updateById(id, dto);
  }

  deleteOption(id: number) {
    return this.deleteById(id);
  }
}
