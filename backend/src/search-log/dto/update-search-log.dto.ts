import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSearchLogDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  count?: number;
}
