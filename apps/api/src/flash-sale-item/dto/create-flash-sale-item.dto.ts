import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashSaleItemDto {
  @ApiProperty({ description: 'Flash sale ID.', example: 12, minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  flash_sale_id: number;

  @ApiProperty({ description: 'Product variant ID.', example: 103, minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  product_variant_id: number;

  @ApiProperty({ description: 'Promotional unit price in VND.', example: 299000, minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  flash_price: number;

  // % giảm (optional – có thể tính từ price gốc)
  @ApiPropertyOptional({ description: 'Discount percentage from the original price.', example: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discount_percent?: number;

  // số lượng bán trong flash sale
  @ApiProperty({ description: 'Quantity allocated to this flash sale item.', example: 50, minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  stock: number;

  // mặc định = 0, admin không cần truyền
  @ApiPropertyOptional({ description: 'Quantity already sold; defaults to zero.', example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sold?: number;

  @ApiPropertyOptional({ description: 'Whether this flash sale item is active.', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
