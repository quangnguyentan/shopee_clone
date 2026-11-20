import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFlashSaleItemDto {
  @ApiProperty({ description: 'Product variant ID to add to the flash sale.', example: 103, minimum: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  product_variant_id: number;

  @ApiProperty({ description: 'Promotional price in VND.', example: 299000, minimum: 0 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  flash_price: number;

  @ApiProperty({ description: 'Quantity reserved for the flash sale.', example: 50, minimum: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stock: number;
}
