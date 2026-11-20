import type { AuthUserSummary } from "./user.type";

export type AuthScope = "admin" | "buyer" | "seller";

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  scope?: AuthScope;
}

export type LoginResponse =
  | {
      authenticated: true;
      sessionId: string;
      user: AuthUserSummary;
    }
  | {
      require2FA: true;
      userId: string;
    }
  | {
      require2FASetup: true;
    };

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface AuthResult {
  success: true;
}

export interface AuthSessionResponse {
  authenticated: true;
  sessionId: string;
  user: AuthUserSummary;
}

export interface QRLoginResponse {
  qr: string;
  sessionId: string;
}

export type QRLoginStatus =
  | { status: "PENDING" }
  | { status: "EXPIRED" }
  | { status: "VERIFIED"; userId: string | null };

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationResponse {
  success?: true;
  cooldown: number;
}

export interface Setup2FAResponse {
  qr: string;
  secret: string;
}

export type RequestPasswordChangeResponse =
  | { require2FA: true; action: "CHANGE_PASSWORD" }
  | { require2FA: false; actionToken: string };

export interface Verify2FAActionRequest {
  token: string;
  action: "CHANGE_PASSWORD";
}

export interface CreateAdminRequest {
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
