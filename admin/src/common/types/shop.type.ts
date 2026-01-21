import type { Product } from "./product.type";
import type { User } from "./user.type";

export interface Shop {
  id: A;

  user: User;

  name: string;

  description: string;

  logo: string;

  rating: number;

  is_active: boolean;

  products: Product[];
}
