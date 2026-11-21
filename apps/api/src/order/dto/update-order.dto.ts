import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  OrderPaymentStatus,
  OrderStatus,
} from '@/common/enums/marketplace.enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  payment_status?: OrderPaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  cancelled_reason?: string;
}
