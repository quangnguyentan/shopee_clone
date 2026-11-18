import type { ProductVariant } from "./product-variant.type";

export interface VariantOption {
  id: A;

  variant_id: number;

  variant: ProductVariant;

  option_name: string; // Color, Size

  option_value: string; // Red, XL
}
