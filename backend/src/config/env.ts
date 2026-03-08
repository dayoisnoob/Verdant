import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string(),

  PORT: z.string().default('8000'),

  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  CORS_ORIGIN: z.string(),
  STRIPE_SECRET_KEY: z.string(),

  JWT_ACCESS_TOKEN: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),

  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_FROM_NAME: z.string(),

  STRIPE_WEBHOOK_SECRET: z.string(),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  REFRESH_COOKIE_MAX_AGE: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables', {
    errors: result.error.format(),
  });
  process.exit(1);
}

export const env = result.data;
