import type { CategoryAttributeValue } from "./category-attribute-value.type";
import type { Category } from "./category.type";

export interface CategoryAttribute {
  id: A;

  category_id: number;

  category: Category;

  name: string; // Size, Color

  type: "select" | "multi-select" | "input";

  allow_custom: boolean;

  order_index: number;

  values?: CategoryAttributeValue[];
}
