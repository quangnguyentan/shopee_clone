import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSearchLogDto {
  @ApiProperty({ description: 'Search phrase entered by the user.', example: 'wireless headphones' })
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
