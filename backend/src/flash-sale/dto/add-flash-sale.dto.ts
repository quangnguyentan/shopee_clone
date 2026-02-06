import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddFlashSaleItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  product_variant_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  flash_price: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stock: number;
}
