import {
  Controller,
  Post,
  UnauthorizedException,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { BaseController } from '@/base/base.controller';
import { ProductImage } from './entities/product-image.entity';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Product Images')
@Controller('product-images')
export class ProductImageController extends BaseController<ProductImage> {
  constructor(protected readonly service: ProductImageService) {
    super(service);
  }

  @Get()
  @AuthRole('admin')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @AuthRole('admin')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Post()
  @AuthRole('admin', 'seller')
  create(
    @Body() dto: CreateProductImageDto,
    @CurrentUser() user?: { userId: number; role: 'admin' | 'seller' },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.createImage(dto, user);
  }

  @Get('product/:id')
  findByProduct(@Param('id') id: number) {
    return this.service.findByProduct(+id);
  }

  @Patch(':id/set-primary')
  @AuthRole('admin', 'seller')
  setPrimary(
    @Param('id') id: string,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.service.setPrimary(id, user);
  }
}
