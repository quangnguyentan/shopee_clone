import type { CategoryAttributeValue } from "@/common/types/category-attribute-value.type";
import type { Category } from "@/common/types/category.type";

export interface CategoryAttributeFormValues {
  id: A;

  category_id: number;

  category: Category;

  name: string; // Size, Color

  type: "select" | "multi-select" | "input";

  allow_custom: boolean;

  order_index: number;

  values?: CategoryAttributeValue[];
}
