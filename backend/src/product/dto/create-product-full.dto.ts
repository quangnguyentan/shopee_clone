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

class ProductAttributeMatrixDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Color, Size

  @IsArray()
  @IsString({ each: true })
  values: string[]; // ['Red', 'Blue']
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
  @Type(() => ProductAttributeMatrixDto)
  attributes: ProductAttributeMatrixDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
