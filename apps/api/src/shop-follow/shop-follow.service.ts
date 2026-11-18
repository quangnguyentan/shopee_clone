import { Injectable } from '@nestjs/common';
import { CreateShopFollowDto } from './dto/create-shop-follow.dto';
import { UpdateShopFollowDto } from './dto/update-shop-follow.dto';

@Injectable()
export class ShopFollowService {
  create(createShopFollowDto: CreateShopFollowDto) {
    return 'This action adds a new shopFollow';
  }

  findAll() {
    return `This action returns all shopFollow`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopFollow`;
  }

  update(id: number, updateShopFollowDto: UpdateShopFollowDto) {
    return `This action updates a #${id} shopFollow`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopFollow`;
  }
}
