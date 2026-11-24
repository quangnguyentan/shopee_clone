import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ShopOrderStatus } from '@/common/enums/marketplace.enums';

export class UpdateSellerOrderStatusDto {
  @IsEnum(ShopOrderStatus)
  status: ShopOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  carrier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  tracking_number?: string;
}
