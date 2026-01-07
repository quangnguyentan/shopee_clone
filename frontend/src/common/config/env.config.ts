import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, "Missing RECAPTCHA key"),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .url("NEXT_PUBLIC_SOCKET_URL must be a valid URL"),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const _env = envSchema.parse({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY:
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_SOCKET_URL:
    process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
});

export const env = {
  ..._env,
  isDev: _env.NODE_ENV === "development",
  isProd: _env.NODE_ENV === "production",
};
