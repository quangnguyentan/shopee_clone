import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const _env = envSchema.parse(process.env);

export const env = {
  ..._env,
  isDev: _env.NODE_ENV === "development",
  isProd: _env.NODE_ENV === "production",
};
