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

export class CreateFlashSaleItemDto {
  @IsNotEmpty()
  @IsInt()
  flash_sale_id: number;

  @IsNotEmpty()
  @IsInt()
  product_variant_id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  flash_price: number;

  // % giảm (optional – có thể tính từ price gốc)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discount_percent?: number;

  // số lượng bán trong flash sale
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  stock: number;

  // mặc định = 0, admin không cần truyền
  @IsOptional()
  @IsInt()
  @Min(0)
  sold?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
