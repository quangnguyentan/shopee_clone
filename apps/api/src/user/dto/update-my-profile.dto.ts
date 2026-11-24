import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other' | null;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^(0\d{9})?$/)
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
