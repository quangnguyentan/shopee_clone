import type { Product } from "./product.type";

export interface ProductImage {
  id: A;

  product: Product;

  url: string;

  is_primary: boolean;
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
