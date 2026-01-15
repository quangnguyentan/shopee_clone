import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantOptionWithVariantDto {
  @Type(() => Number)
  @IsNumber()
  variant_id: number;

  @IsString()
  @IsNotEmpty()
  option_name: string;

  @IsString()
  @IsNotEmpty()
  option_value: string;
}
