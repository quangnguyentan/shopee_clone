export type UserRole = "buyer" | "seller" | "admin";
export type AuthProvider = "local" | "google" | "facebook";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email?: string;
  name: string | null;
  avatar: string | null;
  phone?: string | null;
  role?: UserRole;
  auth_provider?: AuthProvider;
  two_factor_enabled?: boolean;
  admin_level?: number;
  status?: UserStatus;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AuthUserSummary = Pick<User, "id" | "name" | "avatar">;
