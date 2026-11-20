// src/product-variant/dto/update-product-variant.dto.ts
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ description: 'Updated variant price in VND.', example: 529000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Updated available stock quantity.', example: 30, minimum: 0 })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
