import { IsString, MaxLength } from 'class-validator';

export class UpdateProductReviewReplyDto {
  @IsString()
  @MaxLength(2000)
  shop_reply: string;
}
