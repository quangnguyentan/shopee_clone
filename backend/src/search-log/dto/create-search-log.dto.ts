import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSearchLogDto {
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
