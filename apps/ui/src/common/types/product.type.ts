import type { Category } from "./category.type";
import type { ProductImageView } from "./product-image.type";
import type { ProductVariant } from "./product-variant.type";
import type { Shop } from "./shop.type";

export const ProductStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface Product {
  id: string;
  shop_id: string;
  shop?: Shop;
  category_id: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  description: string;
  price_min: number;
  price_max: number;
  stock: number;
  status: ProductStatus;
  sold_count: number;
  view_count: number;
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
  is_featured: boolean;
  variants?: ProductVariant[];
  images?: ProductImageView[];
  created_at: string;
  updated_at: string;
}

export type ProductBuyerListItem = Pick<
  Product,
  "id" | "name" | "price_min" | "price_max" | "sold_count"
> & {
  images: ProductImageView[];
  display_price: number;
  discount_percent: number | null;
};

export type ProductDetail = Product & {
  similar_products?: Product[];
};

export type ProductSearchResult = Pick<
  Product,
  "id" | "name" | "price_min" | "price_max" | "sold_count"
> & {
  search_count: number;
};

export type FlashSaleProduct = Pick<
  Product,
  "id" | "name" | "price_min" | "price_max" | "sold_count"
> & {
  flash_price: number;
};

export interface SearchSuggestion {
  keyword: string;
  count: number;
}

export interface CreateProductRequest {
  shop_id: number;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  stock: number;
  status: ProductStatus;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface ProductAttributeMatrixInput {
  name: string;
  values: string[];
}

export interface ProductVariantInput {
  sku?: string;
  price: number;
  stock: number;
}

export interface CreateProductWithVariantsRequest {
  shop_id: number;
  category_id: number;
  name: string;
  description: string;
  status: ProductStatus;
  attributes: ProductAttributeMatrixInput[];
  variants: ProductVariantInput[];
}
