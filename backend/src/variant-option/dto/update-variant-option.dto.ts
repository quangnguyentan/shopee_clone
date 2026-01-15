import { IsOptional, IsString } from 'class-validator';

export class UpdateVariantOptionDto {
  @IsOptional()
  @IsString()
  option_name?: string;

  @IsOptional()
  @IsString()
  option_value?: string;
}
