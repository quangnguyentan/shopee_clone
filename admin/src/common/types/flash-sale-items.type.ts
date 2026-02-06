import type { FlashSale } from "./flash-sales.type";
import type { ProductVariant } from "./product-variant.type";

export interface FlashSaleItem {
  id: number;

  flash_sale_id: number;

  flash_sale: FlashSale;

  product_variant_id: number;

  product_variant: ProductVariant;

  flash_price: number;

  discount_percent: number;

  stock: number;

  sold: number;

  is_active: boolean;

  created_at: Date;
}

export interface AddFlashSaleItemDto {
  product_variant_id: number;
  flash_price: number;
  stock: number;
}
