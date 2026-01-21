import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateProductDto {
  @Type(() => Number)
  @IsNumber()
  shop_id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price_min: number;

  @Type(() => Number)
  @IsNumber()
  price_max: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;
}
