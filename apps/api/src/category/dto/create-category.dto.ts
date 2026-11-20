import { IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name.', example: 'Men clothing' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Absolute URL of the category image.',
    example: 'https://cdn.example.com/categories/men-clothing.webp',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID. Omit for a root category.',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
