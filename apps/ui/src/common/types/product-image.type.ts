import type { Product } from "./product.type";

export interface ProductImage {
  id: string;

  product_id?: string;

  product?: Product;

  url?: string;

  is_primary: boolean;

  sort_order?: number;
}

export interface ProductImageView extends ProductImage {
  original?: string;
  thumbnail?: string;
  small?: string;
}

export type ProductImageResult = {
  imageKey: string;
  images: {
    original: string;
    thumbnail: string;
    small: string;
  };
};
