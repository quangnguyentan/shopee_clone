import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { VoucherScope } from '@/common/enums/marketplace.enums';

export class CreateVoucherDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code: string;

  @IsEnum(VoucherScope)
  scope: VoucherScope;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  shop_id?: string;

  @IsIn(['percent', 'fixed'])
  discount_type: 'percent' | 'fixed';

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discount_value: number;

  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @IsDateString()
  expired_at: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  usage_limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_user_limit?: number;
}
