import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // email / phone / username

  @IsString()
  password: string;
}
