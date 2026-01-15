import { PartialType } from '@nestjs/mapped-types';
import { CreateShopFollowDto } from './create-shop-follow.dto';

export class UpdateShopFollowDto extends PartialType(CreateShopFollowDto) {}
