import type { Category } from "./category.type";
import type { ProductImage } from "./product-image.type";
import type { ProductVariant } from "./product-variant.type";
import type { Shop } from "./shop.type";

export const ProductStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface Product {
  id: A;

  shop_id: A;

  shop: Shop;

  category_id: A;

  category: Category;

  name: string;

  description: string;

  price_min: number;

  price_max: number;

  stock: number;

  status: ProductStatus;

  variants: ProductVariant[];

  images: ProductImage[];
}
