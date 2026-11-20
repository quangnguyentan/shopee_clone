import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ description: 'Product ID associated with this image.', example: 501, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Absolute image URL.', example: 'https://cdn.example.com/products/501/front.webp' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Whether this is the primary product image.', example: true })
  @IsBoolean()
  is_primary?: boolean;
}
