import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashSaleDto {
  @ApiProperty({ description: 'Flash sale display name.', example: 'Weekend Deals' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Flash sale start time in ISO 8601 format.', example: '2026-11-21T08:00:00.000Z', format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  start_time: Date;

  @ApiProperty({ description: 'Flash sale end time in ISO 8601 format.', example: '2026-11-21T12:00:00.000Z', format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  end_time: Date;

  @ApiPropertyOptional({ description: 'Optional banner image URL.', example: 'https://cdn.example.com/flash-sales/weekend.webp' })
  @IsOptional()
  @IsString()
  banner_image?: string;

  @ApiPropertyOptional({ description: 'Priority used to order flash sales.', example: 10, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
