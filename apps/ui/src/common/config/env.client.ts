import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_PUBLIC_ASSETS_URL: z.string().url(),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NODE_ENV: process.env.NODE_ENV ?? "development",
    NEXT_PUBLIC_ASSETS_URL: process.env.NEXT_PUBLIC_ASSETS_URL,
  });

  if (!parsed.success) {
    if (typeof window === "undefined") {
      return {
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "",
        NEXT_PUBLIC_API_URL: "",
        NEXT_PUBLIC_SOCKET_URL: "",
        NODE_ENV: "production",
        NEXT_PUBLIC_ASSETS_URL: "",
      };
    }

    throw new Error(
      "Missing NEXT_PUBLIC env variables. Check Render environment config.",
    );
  }

  return parsed.data;
}
