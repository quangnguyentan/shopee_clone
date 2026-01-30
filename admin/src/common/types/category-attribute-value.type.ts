import type { CategoryAttribute } from "./category-attribute.type";

export interface CategoryAttributeValue {
  id: A;

  attribute_id: number;

  attribute: CategoryAttribute;

  value: string;
}
