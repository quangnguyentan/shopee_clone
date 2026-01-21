import type { Product } from "./product.type";

export interface ProductImage {
  id: A;

  product: Product;

  url: string;

  is_primary: boolean;
}
