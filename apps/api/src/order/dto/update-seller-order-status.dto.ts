import { IsEnum } from 'class-validator';
import { ShopOrderStatus } from '@/common/enums/marketplace.enums';

export class UpdateSellerOrderStatusDto {
  @IsEnum(ShopOrderStatus)
  status: ShopOrderStatus;
}
