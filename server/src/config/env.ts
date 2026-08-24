import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/smartcity'),
  JWT_ACCESS_SECRET: z.string().min(16).default('smartcity_super_secret_access_key_2026_jwt'),
  JWT_REFRESH_SECRET: z.string().min(16).default('smartcity_super_secret_refresh_key_2026_jwt'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ML_API_URL: z.string().default('http://localhost:8000'),
});

export const env = envSchema.parse(process.env);
