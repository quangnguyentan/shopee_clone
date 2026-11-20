import type { Product } from "./product.type";
import type { ProductVariantAttribute } from "./product-variant-attribute.type";

export interface ProductVariant {
  id: string;
  product_id: string;
  product?: Product;
  sku: string;
  price: number;
  compare_at_price: number | null;
  attribute_signature: string;
  stock: number;
  attributes?: ProductVariantAttribute[];
}
