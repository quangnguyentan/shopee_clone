import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFlashSaleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: Date;

  @IsNotEmpty()
  @IsDateString()
  end_time: Date;

  @IsOptional()
  @IsString()
  banner_image?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
