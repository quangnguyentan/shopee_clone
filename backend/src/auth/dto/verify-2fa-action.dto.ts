import { IsEnum, IsString } from 'class-validator';

export enum SecureAction {
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export class Verify2FAActionDto {
  @IsString()
  token: string; // OTP

  @IsEnum(SecureAction)
  action: SecureAction;
}
