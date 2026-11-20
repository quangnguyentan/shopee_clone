import type { CategoryAttribute } from "./category-attribute.type";

export interface CategoryAttributeValue {
  id: string;

  attribute_id: string;

  attribute: CategoryAttribute;

  value: string;
}
