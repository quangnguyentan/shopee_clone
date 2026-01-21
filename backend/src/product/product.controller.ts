import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@Controller('products')
export class ProductController extends BaseController<Product> {
  constructor(protected readonly service: ProductService) {
    super(service);
  }
  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.service.findByShop(+shopId);
  }
  @Auth()
  @Post('seller')
  createBySeller(@CurrentUser() user, @Body() dto: CreateProductDto) {
    return this.service.createProduct(user.userId, dto);
  }

  @Auth()
  @Patch('seller/:id')
  updateBySeller(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(+id, user.userId, dto);
  }

  @Auth()
  @Delete('seller/:id')
  deleteBySeller(@Param('id') id: string, @CurrentUser() user) {
    return this.service.deleteProduct(+id, user.userId);
  }

  @AuthRole('admin')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @AuthRole('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }
}
