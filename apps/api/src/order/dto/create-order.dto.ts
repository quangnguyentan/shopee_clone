import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export const CHECKOUT_PAYMENT_METHODS = [
  'vnpay',
  'momo',
  'vietqr_manual',
  'cod',
] as const;

export type CheckoutPaymentMethod =
  (typeof CHECKOUT_PAYMENT_METHODS)[number];

export class CheckoutShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiver_name: string;

  @IsString()
  @Matches(/^0\d{9}$/)
  phone: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  province_code: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  ward_code: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ward_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CheckoutShippingAddressDto)
  shipping_address: CheckoutShippingAddressDto;

  @IsIn(CHECKOUT_PAYMENT_METHODS)
  payment_method: CheckoutPaymentMethod;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^\d+$/, { each: true })
  selected_item_ids?: string[];
}
