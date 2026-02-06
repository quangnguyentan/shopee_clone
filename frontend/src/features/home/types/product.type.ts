import { Category } from "@/src/common/types/category.type";
import {
  ProductImage,
  ProductImageView,
} from "@/src/common/types/product-image.type";
import { ProductVariant } from "@/src/common/types/product-variant.type";
import { ProductStatus } from "@/src/common/types/product.type";
import { Shop } from "@/src/common/types/shop.type";

/* eslint-disable @typescript-eslint/no-explicit-any */
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

  sold_count: number; // bán được bao nhiêu

  view_count: number; // được xem bao nhiêu

  rating_avg: number; // điểm trung bình

  rating_count: number; // số lượt đánh giá

  is_featured: boolean;

  status: ProductStatus;

  variants: ProductVariant[];

  images: ProductImageView[];
}
