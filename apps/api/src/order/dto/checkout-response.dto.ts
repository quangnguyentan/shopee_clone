import { ApiProperty } from '@nestjs/swagger';
import {
  OrderPaymentStatus,
  OrderStatus,
  ShopOrderShippingStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';

export class OrderItemSummaryDto {
  @ApiProperty({ description: 'Order item ID.', example: '801' })
  id: string;

  @ApiProperty({
    description: 'Product name captured at checkout.',
    example: 'Wireless Headphones',
  })
  product_name: string;

  @ApiProperty({
    description: 'Product SKU captured at checkout.',
    example: 'WH-BLK-01',
  })
  sku: string;

  @ApiProperty({
    description: 'Selected variant label, if the product has variants.',
    example: 'Black / Large',
    nullable: true,
  })
  variant_label: string | null;

  @ApiProperty({
    description: 'Product image URL captured at checkout.',
    example: 'https://cdn.example.com/products/801.webp',
    nullable: true,
  })
  image_url: string | null;

  @ApiProperty({
    description: 'Unit price in the order currency.',
    example: '499000.00',
  })
  price: string;

  @ApiProperty({ description: 'Quantity purchased.', example: 2, minimum: 1 })
  quantity: number;
}

export class ShopOrderSummaryDto {
  @ApiProperty({ description: 'Child shop order ID.', example: '501' })
  id: string;

  @ApiProperty({ description: 'Parent order ID.', example: '401' })
  order_id: string;

  @ApiProperty({
    description: 'Shop ID that fulfills this child order.',
    example: '42',
  })
  shop_id: string;

  @ApiProperty({
    description: 'Shop-specific order number.',
    example: 'SO-20261121-0001',
  })
  shop_order_no: string;

  @ApiProperty({ description: 'Items subtotal.', example: '998000.00' })
  subtotal: string;

  @ApiProperty({
    description: 'Shipping fee for this shop order.',
    example: '30000.00',
  })
  shipping_fee: string;

  @ApiProperty({
    description: 'Discount allocated to this shop order.',
    example: '50000.00',
  })
  discount_amount: string;

  @ApiProperty({
    description: 'Final amount for this shop order.',
    example: '978000.00',
  })
  total_amount: string;

  @ApiProperty({ description: 'ISO 4217 currency code.', example: 'VND' })
  currency: string;

  @ApiProperty({
    enum: ShopOrderStatus,
    example: ShopOrderStatus.PENDING_PAYMENT,
  })
  status: ShopOrderStatus;

  @ApiProperty({
    enum: ShopOrderShippingStatus,
    example: ShopOrderShippingStatus.UNFULFILLED,
  })
  shipping_status: ShopOrderShippingStatus;

  @ApiProperty({
    type: [OrderItemSummaryDto],
    description: 'Items fulfilled by this shop.',
  })
  items: OrderItemSummaryDto[];
}

export class CheckoutResponseDto {
  @ApiProperty({ description: 'Parent order ID.', example: '401' })
  id: string;

  @ApiProperty({
    description: 'Marketplace-wide order number.',
    example: 'ORD-20261121-0001',
  })
  order_no: string;

  @ApiProperty({
    description: 'Total item subtotal across all shops.',
    example: '1498000.00',
  })
  subtotal: string;

  @ApiProperty({
    description: 'Total shipping fee across all shops.',
    example: '60000.00',
  })
  shipping_fee: string;

  @ApiProperty({
    description: 'Total discount across all shops.',
    example: '50000.00',
  })
  discount_amount: string;

  @ApiProperty({
    description: 'Final amount due for the parent order.',
    example: '1508000.00',
  })
  total_amount: string;

  @ApiProperty({ description: 'ISO 4217 currency code.', example: 'VND' })
  currency: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @ApiProperty({
    enum: OrderPaymentStatus,
    example: OrderPaymentStatus.PENDING,
  })
  payment_status: OrderPaymentStatus;

  @ApiProperty({
    type: [ShopOrderSummaryDto],
    description: 'One child order per shop represented in the checkout.',
  })
  shop_orders: ShopOrderSummaryDto[];
}
