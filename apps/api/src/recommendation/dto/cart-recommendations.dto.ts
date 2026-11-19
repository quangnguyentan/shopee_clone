import { IsArray, IsInt, Min } from 'class-validator';

export class CartRecommendationsDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  product_ids: number[];
}
