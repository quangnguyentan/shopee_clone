import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SecureAction {
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export class Verify2FAActionDto {
  @ApiProperty({ description: 'One-time security code.', example: '123456' })
  @IsString()
  token: string; // OTP

  @ApiProperty({
    description: 'Protected action being authorized.',
    enum: SecureAction,
    example: SecureAction.CHANGE_PASSWORD,
  })
  @IsEnum(SecureAction)
  action: SecureAction;
}
