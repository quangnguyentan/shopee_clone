import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KeywordRecommendationQueryDto {
  @ApiProperty({ description: 'Keyword used to find recommendations.', example: 'wireless headphones' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: 'Maximum number of recommendations to return.', example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
