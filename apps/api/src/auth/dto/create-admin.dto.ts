import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'Administrator email address.', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Initial password (at least 8 characters).', example: 'AdminPass123!', minLength: 8, format: 'password' })
  @MinLength(8)
  password: string;
}
