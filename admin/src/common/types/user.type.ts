type Role = "buyer" | "seller" | "admin";

export interface User {
  id: number;

  email: string;

  password: string;

  name: string;

  phone: string;

  avatar: string;

  role: Role;

  two_factor_enabled: boolean;

  two_factor_secret: string;

  shop: [];

  orders: [];

  created_at: Date;

  updated_at: Date;

  sessionId: string;
}
