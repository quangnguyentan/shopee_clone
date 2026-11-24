import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '@/base/base.dto';

export class PublicProductReviewsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  product_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
