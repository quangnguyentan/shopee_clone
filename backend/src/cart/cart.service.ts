import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { Repository } from 'typeorm';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly itemRepo: Repository<CartItem>,
  ) {}

  async getMyCart(userId: number) {
    return this.cartRepo.findOne({
      where: { user: { id: userId } } as any,
      relations: ['items', 'items.product_variant'],
    });
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    let cart = await this.getMyCart(userId);

    if (!cart) {
      cart = await this.cartRepo.save({
        user: { id: userId } as any,
      });
    }

    const existedItem = await this.itemRepo.findOne({
      where: {
        cart: { id: cart.id },
        product_variant: { id: dto.variant_id },
      } as any,
    });

    if (existedItem) {
      existedItem.quantity += dto.quantity;
      return this.itemRepo.save(existedItem);
    }

    return this.itemRepo.save({
      cart: { id: cart.id } as any,
      product_variant: { id: dto.variant_id } as any,
      quantity: dto.quantity,
    });
  }

  async removeItem(itemId: number, userId: number) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });

    if (!item || item.cart.user.id !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.itemRepo.delete(itemId);
    return { success: true };
  }
}
