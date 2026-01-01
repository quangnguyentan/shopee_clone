import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  actionToken: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
