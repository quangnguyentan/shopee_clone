import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Auth()
@Controller('carts')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getMyCart(@CurrentUser() user) {
    return this.service.getMyCart(user.userId);
  }

  @Post('items')
  addItem(@CurrentUser() user, @Body() dto: AddCartItemDto) {
    return this.service.addItem(user.userId, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string, @CurrentUser() user) {
    return this.service.removeItem(Number(id), user.userId);
  }
}
