import type { Shop } from "./shop.type";

type Role = "buyer" | "seller" | "admin";

export interface User {
  id: A;

  email: string;

  name: string;

  phone?: string;

  avatar?: string;

  role: Role;

  status: "PENDING" | "ACTIVE" | "SUSPENDED";

  two_factor_enabled?: boolean;

  shop?: Shop;

  created_at: Date | string;

  updated_at?: Date | string;
}
