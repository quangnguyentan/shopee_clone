// src/common/config/env.config.ts
import { z } from "zod";
import { config as dotenvConfig } from "dotenv";
import path from "path";

// Load env file theo NODE_ENV
dotenvConfig({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production"
      ? ".env.production.local"
      : ".env.development.local"
  ),
});

const envSchema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, "Missing RECAPTCHA key"),
  NEXT_PUBLIC_API_URL: z.string().url("Invalid NEXT_PUBLIC_API_URL"),
  NEXT_PUBLIC_SOCKET_URL: z.string().url("Invalid NEXT_PUBLIC_SOCKET_URL"),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const _env = envSchema.parse({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
});

export const env = {
  ..._env,
  isDev: _env.NODE_ENV === "development",
  isProd: _env.NODE_ENV === "production",
};
