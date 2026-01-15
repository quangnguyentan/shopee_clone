import { Injectable } from '@nestjs/common';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';

@Injectable()
export class FlashSaleItemService {
  create(createFlashSaleItemDto: CreateFlashSaleItemDto) {
    return 'This action adds a new flashSaleItem';
  }

  findAll() {
    return `This action returns all flashSaleItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flashSaleItem`;
  }

  update(id: number, updateFlashSaleItemDto: UpdateFlashSaleItemDto) {
    return `This action updates a #${id} flashSaleItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} flashSaleItem`;
  }
}
