import type { ProductVariant } from "./product-variant.type";
import type { CategoryAttribute } from "./category-attribute.type";
import type { CategoryAttributeValue } from "./category-attribute-value.type";

export interface ProductVariantAttribute {
  id: number;

  variant_id: number;
  variant: ProductVariant;

  attribute_id: number;
  attribute: CategoryAttribute;

  value_id: number | null;
  value: CategoryAttributeValue | null;

  custom_value: string | null;

  created_at: string;
}
