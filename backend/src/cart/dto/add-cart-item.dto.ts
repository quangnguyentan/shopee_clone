import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  variant_id: number;
}
