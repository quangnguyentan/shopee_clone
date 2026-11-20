import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'One-time action token issued after verification.', example: 'eyJhbGciOi...' })
  @IsString()
  actionToken: string;

  @ApiProperty({ description: 'New password (at least 8 characters).', example: 'NewPass123!', minLength: 8, format: 'password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
