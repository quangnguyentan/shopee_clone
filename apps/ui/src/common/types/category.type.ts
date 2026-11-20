import type { CategoryAttribute } from "./category-attribute.type";

export interface Category {
  id: string;
  parent: Category | null;
  children: Category[];
  name: string;
  imageUrl: string | null;
  slug: string;
  attributes?: CategoryAttribute[];
}

export interface CreateCategoryRequest {
  name: string;
  imageUrl?: string;
  parent_id?: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
