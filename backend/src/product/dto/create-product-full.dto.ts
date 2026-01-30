import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from './create-product.dto';

class VariantAttributeDto {
  @IsString()
  @IsNotEmpty()
  attribute_name: string; // Size, Color

  @IsString()
  @IsNotEmpty()
  value: string; // S, M, Red, ...
}

class VariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];
}

export class CreateProductWithVariantDto {
  @Type(() => Number)
  @IsNumber()
  shop_id: number;

  @Type(() => Number)
  @IsNumber()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
