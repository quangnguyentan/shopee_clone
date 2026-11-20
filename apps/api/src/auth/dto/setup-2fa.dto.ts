import { ApiProperty } from '@nestjs/swagger';

export class Setup2FADto {
  @ApiProperty({ description: 'User ID for which to create a 2FA setup.', example: 'user_123' })
  userId: string;
}
