import {
  Body,
  Controller,
  Delete,
  Get,
  BadRequestException,
  UnauthorizedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CreateProductWithVariantDto } from './dto/create-product-full.dto';
import { PaginationDto } from '@/base/base.dto';
import { OptionalAuth } from '@/common/decorators/optional-auth.decorator';
import { RecommendationClient } from '@/recommendation/recommendation.client';
import { RecommendationFilterDto } from '@/recommendation/dto/recommendation-filter.dto';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Products')
@Controller('products')
export class ProductController extends BaseController<Product> {
  constructor(
    protected readonly service: ProductService,
    private readonly recommendations: RecommendationClient,
  ) {
    super(service);
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.service.findByShop(+shopId);
  }
  @AuthRole('admin', 'seller')
  @Post('seller')
  @ApiAuthenticated()
  createBySeller(@CurrentUser() user, @Body() dto: CreateProductDto) {
    return this.service.createProduct(user, dto);
  }

  @AuthRole('admin', 'seller')
  @Patch('seller/:id')
  @ApiAuthenticated()
  updateBySeller(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(+id, user, dto);
  }

  @AuthRole('admin', 'seller')
  @Delete('seller/:id')
  @ApiAuthenticated()
  deleteBySeller(@Param('id') id: string, @CurrentUser() user) {
    return this.service.deleteProduct(+id, user);
  }
  @Get('buyer')
  findAllView(@Query() query: PaginationDto) {
    return this.service.findAllView(query);
  }
  @Get('buyer/:id')
  async viewProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: RecommendationFilterDto,
  ) {
    if (
      filters.min_price !== undefined &&
      filters.max_price !== undefined &&
      filters.min_price > filters.max_price
    ) {
      throw new BadRequestException(
        'min_price must be less than or equal to max_price',
      );
    }

    const product = await this.service.viewProduct(id);
    if (!product) return product;

    const similar_products = await this.recommendations.getSimilarProducts(
      id,
      filters,
    );
    return { ...product, similar_products };
  }

  @AuthRole('admin', 'seller')
  @Get('')
  @ApiAuthenticated()
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser() user?: { userId: number; role: 'admin' | 'seller' },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.findManagedProducts(query, user);
  }

  @AuthRole('admin', 'seller')
  @Get(':id')
  @ApiAuthenticated()
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { userId: number; role: 'admin' | 'seller' },
  ) {
    if (!user) throw new UnauthorizedException();
    return this.service.findOneById(+id, user);
  }

  @AuthRole('admin', 'seller')
  @Post('seller/full')
  @ApiAuthenticated()
  createFull(@CurrentUser() user, @Body() dto: CreateProductWithVariantDto) {
    return this.service.createFullProduct(user, dto);
  }

  @AuthRole('admin', 'seller')
  @Put('seller/:id/full')
  @ApiAuthenticated()
  updateFull(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductWithVariantDto,
  ) {
    return this.service.updateFullProduct(id, user, dto);
  }
  @OptionalAuth()
  @Get('search')
  search(
    @Query('q') q: string,
    @Query() query: PaginationDto,
    @CurrentUser() user?: { userId: number },
  ) {
    return this.service.searchProducts(q, query, user?.userId);
  }
  @Get('search/suggest')
  getSearchSuggest() {
    return this.service.getSearchSuggestToday();
  }

  @Get('top/sold')
  topSold() {
    return this.service.topSold();
  }

  @Get('top/view')
  topView() {
    return this.service.topView();
  }

  @Get('suggest/today')
  suggestToday() {
    return this.service.suggestToday();
  }

  @Get('flash-sale/ranking')
  flashSaleRanking() {
    return this.service.flashSaleRanking();
  }

  @Get('top-search/today')
  getTopSearchProductToday(@Query('limit') limit?: string) {
    return this.service.topSearchProductToday(limit ? Number(limit) : 10);
  }
}
