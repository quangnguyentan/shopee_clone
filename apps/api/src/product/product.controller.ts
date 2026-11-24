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
import { BuyerProductsQueryDto } from './dto/buyer-products-query.dto';
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
  findAllView(@Query() query: BuyerProductsQueryDto) {
    if (
      query.min_price !== undefined &&
      query.max_price !== undefined &&
      query.min_price > query.max_price
    ) {
      throw new BadRequestException('Invalid product price range');
    }
    const attributeFilters = this.parseAttributeFilters(
      query.attribute_filters,
    );

    return this.service.findAllView(
      query,
      query.category_id?.toString(),
      query.min_price,
      query.max_price,
      {
        minRating: query.min_rating,
        mallOnly: query.mall_only,
        discountedOnly: query.discounted_only,
        inStock: query.in_stock,
        provinceCodes: query.province_codes,
        attributeFilters,
        sort: query.sort,
      },
    );
  }

  private parseAttributeFilters(value?: string) {
    if (!value) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new BadRequestException('Invalid attribute filters');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BadRequestException('Invalid attribute filters');
    }

    const filters = Object.entries(parsed);
    if (filters.length > 20) {
      throw new BadRequestException('Too many attribute filters');
    }

    return filters.map(([attributeId, valueIds]) => {
      if (
        !/^[1-9]\d*$/.test(attributeId) ||
        !Array.isArray(valueIds) ||
        valueIds.length === 0 ||
        valueIds.length > 50 ||
        valueIds.some((id) => typeof id !== 'string' || !/^[1-9]\d*$/.test(id))
      ) {
        throw new BadRequestException('Invalid attribute filters');
      }

      return { attributeId, valueIds };
    });
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

    const recommendationResults = await this.recommendations.getSimilarProducts(
      id,
      filters,
    );
    let similar_products = await this.service.findRecommendedProducts(
      recommendationResults.map(({ product_id }) => product_id),
      id,
    );
    if (similar_products.length === 0) {
      similar_products = await this.service.findRelatedProducts(
        id,
        product.category_id,
        product.shop_id,
      );
    }
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
