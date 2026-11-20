import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Account email, phone number, or username.',
    example: 'buyer@example.com',
  })
  @IsString()
  identifier: string; // email / phone / username

  @ApiProperty({
    description: 'Account password.',
    example: 'ExamplePass123!',
    format: 'password',
  })
  @IsString()
  password: string;
}
