// dto/register.dto.ts
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export class RegisterDto {
  @ApiProperty({ description: 'New account email address.', example: 'buyer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (at least 6 characters).',
    example: 'ExamplePass123!',
    minLength: 6,
    format: 'password',
  })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Optional phone number.', example: '+84901234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}
