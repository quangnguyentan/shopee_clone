import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '@/base/base.dto';
import { OrderStatus } from '@/common/enums/marketplace.enums';

export class BuyerOrdersQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
