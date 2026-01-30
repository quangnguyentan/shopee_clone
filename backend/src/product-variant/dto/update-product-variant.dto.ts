// src/product-variant/dto/update-product-variant.dto.ts
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;
}
