import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '@/base/base.dto';

export class ManagedUsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['buyer', 'seller', 'admin'] })
  @IsOptional()
  @IsIn(['buyer', 'seller', 'admin'])
  role?: 'buyer' | 'seller' | 'admin';
}
