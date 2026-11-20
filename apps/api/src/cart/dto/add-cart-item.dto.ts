import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ description: 'Number of units to add.', example: 2, minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'ID of the product variant to add.',
    example: 103,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  variant_id: number;
}
