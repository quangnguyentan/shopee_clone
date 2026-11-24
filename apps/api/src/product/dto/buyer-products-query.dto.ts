import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ArrayMaxSize,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '@/base/base.dto';

export const BUYER_PRODUCT_SORTS = [
  'popular',
  'latest',
  'sales',
  'price-asc',
  'price-desc',
] as const;

export type BuyerProductSort = (typeof BUYER_PRODUCT_SORTS)[number];

export class BuyerProductsQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  min_rating?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  mall_only?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  discounted_only?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  in_stock?: boolean;

  @IsOptional()
  @IsIn(BUYER_PRODUCT_SORTS)
  sort?: BuyerProductSort;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  attribute_filters?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value
      .split(',')
      .filter(Boolean)
      .map(Number);
  })
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  province_codes?: number[];
}
