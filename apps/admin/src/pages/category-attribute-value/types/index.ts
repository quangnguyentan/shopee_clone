import type { CategoryAttribute } from "@/common/types/category-attribute.type";

export interface CategoryAttributeValueFormValues {
  id: A;

  attribute_id: number;

  attribute: CategoryAttribute;

  value: string;
}
