import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ description: 'Parent product ID.', example: 501, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Variant price in VND.', example: 499000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Available stock quantity.', example: 25, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  stock: number;
}
