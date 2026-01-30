import type { Shop } from "./shop.type";

type Role = "buyer" | "seller" | "admin";

export interface User {
  id: A;

  email: string;

  password: string;

  name: string;

  phone: string;

  avatar: string;

  role: Role;

  two_factor_enabled: boolean;

  two_factor_secret: string;

  shop: Shop;

  orders: [];

  created_at: Date;

  updated_at: Date;

  sessionId: string;
}
