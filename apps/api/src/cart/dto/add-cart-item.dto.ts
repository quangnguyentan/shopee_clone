import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({
    description: 'Number of units to add.',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'ID of the product variant to add.',
    example: 103,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  variant_id: number;
}
