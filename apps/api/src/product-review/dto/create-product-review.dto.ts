import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';

export class CreateProductReviewDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  order_item_id: string;

  @IsString()
  @Matches(/^[1-9]\d*$/)
  product_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;
}
