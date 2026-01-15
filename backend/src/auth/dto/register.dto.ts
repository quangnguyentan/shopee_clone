// dto/register.dto.ts
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum Role {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
