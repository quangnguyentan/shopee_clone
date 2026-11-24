import type { Product } from "./product.type";
import type { User } from "./user.type";

export interface Shop {
  id: string;

  user?: User;

  name: string;

  description: string;

  logo: string;

  rating: number;

  follower_count?: number;

  rating_count?: number;

  province_code?: number | null;

  province_name?: string | null;

  is_mall?: boolean;

  is_active: boolean;

  products?: Product[];
}
