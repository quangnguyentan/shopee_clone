// src/variant-option/dto/create-variant-option.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVariantOptionDto {
  @IsString()
  @IsNotEmpty()
  option_name: string;

  @IsString()
  @IsNotEmpty()
  option_value: string;
}
