import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

const _env = envSchema.parse(process.env);

export const config = {
  db: {
    url: _env.DATABASE_URL,
  },
  port: _env.PORT,
  jwt: {
    accessSecret: _env.JWT_ACCESS_SECRET,
    refreshSecret: _env.JWT_REFRESH_SECRET,
  },
  isDev: _env.NODE_ENV === 'development',
  isProd: _env.NODE_ENV === 'production',
};
