// src/common/config/env.client.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export function getEnv() {
  // chỉ parse runtime, không top-level
  return envSchema.parse({
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NODE_ENV: process.env.NODE_ENV ?? "development",
  });
}
