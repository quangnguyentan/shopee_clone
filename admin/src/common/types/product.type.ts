import type { ProductImage } from "./product-image.type";
import type { ProductVariant } from "./product-variant.type";
import type { Shop } from "./shop.type";

export type ProductStatus = "active" | "inactive";

export interface Product {
  id: A;

  shop_id: A;

  shop: Shop;

  name: string;

  description: string;

  price_min: number;

  price_max: number;

  stock: number;

  status: ProductStatus;

  variants: ProductVariant[];

  images: ProductImage[];
}
