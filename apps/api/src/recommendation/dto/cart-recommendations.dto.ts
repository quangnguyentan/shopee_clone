import { IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartRecommendationsDto {
  @ApiProperty({ description: 'Product IDs in the buyer cart context.', example: [501, 502], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  product_ids: number[];
}
