import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  is_primary?: boolean;
}
