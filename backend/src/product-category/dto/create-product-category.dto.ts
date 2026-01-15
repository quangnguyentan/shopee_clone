import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductCategoryDto {
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @Type(() => Number)
  @IsNumber()
  category_id: number;
}
