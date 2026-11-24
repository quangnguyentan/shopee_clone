import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ description: 'ID of the user who owns the shop.', example: 24, minimum: 1 })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'Shop display name.', example: 'Everyday Home' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Short shop description.', example: 'Home and lifestyle products.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Shop logo URL.', example: 'https://cdn.example.com/shops/24/logo.webp' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: 'Shop rating.', example: 4.8, minimum: 0, maximum: 5 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Whether the shop is active.', example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Vietnam province/city code.', example: 1 })
  @IsInt()
  @IsOptional()
  province_code?: number | null;

  @ApiPropertyOptional({ description: 'Vietnam province/city name.', example: 'Thành phố Hà Nội' })
  @IsString()
  @IsOptional()
  province_name?: string | null;
}
