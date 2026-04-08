import 'dotenv/config';
import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string(),
  DATABASE_URL_TEST: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  PORT: z.string().default('8000'),

  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  CORS_ORIGIN: z.string(),
  STRIPE_SECRET_KEY: z.string(),

  JWT_ACCESS_TOKEN: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional(),

  STRIPE_WEBHOOK_SECRET: z.string(),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  REFRESH_COOKIE_MAX_AGE: z.string(),

  RESEND_API: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error(
    { errors: result.error.format() },
    'Invalid environment variables'
  );
  process.exit(1);
}

export const env = result.data;
