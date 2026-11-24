import type { Product } from "./product.type";
import type { User } from "./user.type";

export interface Shop {
  id: string;

  user: Pick<User, "id" | "email" | "name">;

  name: string;

  description: string;

  logo: string;

  rating: number;

  province_code: number | null;

  province_name: string | null;

  is_active: boolean;

  products: Product[];
}
