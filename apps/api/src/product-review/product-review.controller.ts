import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '@/base/base.dto';
import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewReplyDto } from './dto/update-product-review-reply.dto';
import { ProductReviewService } from './product-review.service';

@ApiControllerDocs('Product Reviews')
@Controller('product-review')
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  @AuthRole('buyer')
  @Post()
  create(
    @Body() dto: CreateProductReviewDto,
    @CurrentUser() user: { userId: number; role: 'buyer' },
  ) {
    return this.productReviewService.create(dto, user);
  }

  @AuthRole('admin', 'seller')
  @Get('manage')
  findManaged(
    @Query() query: PaginationDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.productReviewService.findManaged(user, query);
  }

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('product_id') productId?: string,
  ) {
    return this.productReviewService.findAllPublic(query, productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productReviewService.findOne(id);
  }

  @AuthRole('admin', 'seller')
  @Patch(':id/reply')
  updateReply(
    @Param('id') id: string,
    @Body() dto: UpdateProductReviewReplyDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.productReviewService.updateReply(id, dto, user);
  }

  @AuthRole('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productReviewService.remove(id);
  }
}
