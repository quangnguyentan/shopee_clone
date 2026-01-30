import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class CreateProductVariantDto {
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;
}
