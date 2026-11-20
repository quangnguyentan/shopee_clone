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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProductAttributeMatrixDto {
  @ApiProperty({ description: 'Attribute name such as color or size.', example: 'Color' })
  @IsString()
  @IsNotEmpty()
  name: string; // Color, Size

  @ApiProperty({ description: 'Values available for this attribute.', example: ['Black', 'White'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  values: string[]; // ['Red', 'Blue']
}

class VariantDto {
  @ApiPropertyOptional({ description: 'Seller SKU for the variant.', example: 'HEADPHONE-BLK' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Variant price in VND.', example: 499000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Available quantity for this variant.', example: 25, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  stock: number;
}

export class CreateProductWithVariantDto {
  @ApiProperty({ description: 'ID of the seller shop.', example: 42, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  shop_id: number;

  @ApiProperty({ description: 'ID of the product category.', example: 7, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  category_id: number;

  @ApiProperty({ description: 'Product title.', example: 'Wireless Bluetooth Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product description.', example: 'Over-ear headphones with noise cancellation.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product visibility status.', enum: ProductStatus, example: ProductStatus.active })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({
    description: 'Attribute matrix used to create product variants.',
    type: [ProductAttributeMatrixDto],
    example: [{ name: 'Color', values: ['Black', 'White'] }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeMatrixDto)
  attributes: ProductAttributeMatrixDto[];

  @ApiProperty({
    description: 'Variant combinations with prices and stock.',
    type: [VariantDto],
    example: [{ sku: 'HEADPHONE-BLK', price: 499000, stock: 25 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
