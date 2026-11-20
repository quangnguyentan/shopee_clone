import { ApiProperty } from '@nestjs/swagger';

export class Verify2FADto {
  @ApiProperty({ description: 'User ID associated with the 2FA challenge.', example: 'user_123' })
  userId: string;

  @ApiProperty({ description: 'One-time authenticator code.', example: '123456' })
  token: string;
}
