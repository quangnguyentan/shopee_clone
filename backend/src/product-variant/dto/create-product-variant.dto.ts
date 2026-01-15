import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { CreateVariantOptionDto } from '@/variant-option/dto/create-variant-option.dto';

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantOptionDto)
  options: CreateVariantOptionDto[];
}
