import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSearchLogDto {
  @ApiPropertyOptional({ description: 'Updated search count.', example: 4, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  count?: number;
}
