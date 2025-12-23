import { Injectable } from '@nestjs/common';
import { CreateVariantOptionDto } from './dto/create-variant-option.dto';
import { UpdateVariantOptionDto } from './dto/update-variant-option.dto';

@Injectable()
export class VariantOptionService {
  create(createVariantOptionDto: CreateVariantOptionDto) {
    return 'This action adds a new variantOption';
  }

  findAll() {
    return `This action returns all variantOption`;
  }

  findOne(id: number) {
    return `This action returns a #${id} variantOption`;
  }

  update(id: number, updateVariantOptionDto: UpdateVariantOptionDto) {
    return `This action updates a #${id} variantOption`;
  }

  remove(id: number) {
    return `This action removes a #${id} variantOption`;
  }
}
