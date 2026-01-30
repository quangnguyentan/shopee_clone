import type { CategoryAttribute } from "./category-attribute.type";

export interface Category {
  id: A;

  parent: Category;

  children: Category[];

  name: string;

  imageUrl: string;

  attributes: CategoryAttribute[];
}
