import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const _env = envSchema.parse({
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:8080" : ""),
  NEXT_PUBLIC_SOCKET_URL:
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:8080" : ""),
  NODE_ENV: process.env.NODE_ENV ?? "development",
});

export const env = {
  ..._env,
  isDev: _env.NODE_ENV === "development",
  isProd: _env.NODE_ENV === "production",
};
