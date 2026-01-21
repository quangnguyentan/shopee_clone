import type { Product } from "./product.type";
import type { VariantOption } from "./variant-option.type";

export interface ProductVariant {
  id: A;

  product: Product;

  sku: string;

  price: number;

  stock: number;

  options: VariantOption[];
}
