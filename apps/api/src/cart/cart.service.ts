import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { Repository } from 'typeorm';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly itemRepo: Repository<CartItem>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async getMyCart(userId: number) {
    return this.cartRepo.findOne({
      where: { user: { id: userId } } as any,
      relations: [
        'items',
        'items.product_variant',
        'items.product_variant.product',
        'items.product_variant.product.images',
        'items.product_variant.product.shop',
        'items.product_variant.attributes',
        'items.product_variant.attributes.attribute',
        'items.product_variant.attributes.value',
      ],
    });
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: String(dto.variant_id) },
      relations: ['product'],
    });
    if (!variant || !variant.product || variant.product.status !== 'active') {
      throw new NotFoundException('Product variant not found');
    }

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
      if (existedItem.quantity + dto.quantity > variant.stock) {
        throw new BadRequestException(
          'Requested quantity exceeds available stock',
        );
      }
      existedItem.quantity += dto.quantity;
      return this.itemRepo.save(existedItem);
    }

    if (dto.quantity > variant.stock) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
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

    if (!item || item.cart?.user?.id !== String(userId)) {
      throw new ForbiddenException('Not allowed');
    }

    await this.itemRepo.delete(itemId);
    return { success: true };
  }

  async updateItem(
    itemId: number,
    userId: number,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user', 'product_variant'],
    });
    if (!item || item.cart?.user?.id !== String(userId)) {
      throw new NotFoundException('Cart item not found');
    }

    const variant = await this.variantRepo.findOne({
      where: { id: String(item.product_variant.id) },
      relations: ['product'],
    });
    if (!variant || variant.product?.status !== 'active') {
      throw new NotFoundException('Product variant not found');
    }
    if (dto.quantity > variant.stock) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    item.quantity = dto.quantity;
    await this.itemRepo.save(item);
    return { id: item.id, quantity: item.quantity };
  }
}
