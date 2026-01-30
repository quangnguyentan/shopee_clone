import type { Product } from "./product.type";

export interface ProductVariant {
  id: A;
  product_id: A;
  product: Product;
  sku: string;
  price: number;
  stock: number;

  attributes: {
    attribute_id: A;
    name: string;
    value: string;
  }[];
}
