import {
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  ApiAuthenticated,
  ApiControllerDocs,
} from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Cart')
@Auth()
@Controller('carts')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  @ApiAuthenticated()
  getMyCart(@CurrentUser() user) {
    return this.service.getMyCart(user.userId);
  }

  @Post('items')
  @ApiAuthenticated()
  addItem(@CurrentUser() user, @Body() dto: AddCartItemDto) {
    return this.service.addItem(user.userId, dto);
  }

  @Patch('items/:id')
  @ApiAuthenticated()
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.service.updateItem(id, user.userId, dto);
  }

  @Delete('items/:id')
  @ApiAuthenticated()
  removeItem(@Param('id') id: string, @CurrentUser() user) {
    return this.service.removeItem(Number(id), user.userId);
  }
}
