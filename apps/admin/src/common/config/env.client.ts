// src/common/config/env.client.ts
import { z } from "zod";

const envSchema = z.object({
  VITE_ASSET_URL: z.string().url(),
  VITE_PUBLIC_API_URL: z.string().url(),
  VITE_PUBLIC_SOCKET_URL: z.string().url(),
  VITE_NODE_ENV: z.enum(["development", "production", "test"]),
});

export function getEnv() {
  // chỉ parse runtime, không top-level
  return envSchema.parse({
    VITE_ASSET_URL: import.meta.env.VITE_ASSET_URL,
    VITE_PUBLIC_API_URL: import.meta.env.VITE_PUBLIC_API_URL,
    VITE_PUBLIC_SOCKET_URL: import.meta.env.VITE_PUBLIC_SOCKET_URL,
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV ?? "development",
  });
}
