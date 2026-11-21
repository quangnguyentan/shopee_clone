import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  active = 'active',
  inactive = 'inactive',
}
export class CreateProductDto {
  @ApiProperty({ description: 'ID of the seller shop.', example: 42, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  shop_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id: number;

  @ApiProperty({ description: 'Product title shown to buyers.', example: 'Wireless Bluetooth Headphones' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description.', example: 'Over-ear headphones with noise cancellation.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Lowest variant price in VND.', example: 499000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min: number;

  @ApiProperty({ description: 'Highest variant price in VND.', example: 899000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max: number;

  @ApiProperty({ description: 'Available stock quantity.', example: 120, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Product visibility status.',
    enum: ProductStatus,
    example: ProductStatus.active,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
