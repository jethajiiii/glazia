import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file before validation
dotenv.config();

/**
 * Zod schema defining backend environment contract.
 * Fails fast on application startup if required configs are missing or malformed.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .default('mongodb://127.0.0.1:27017/mini-design-canvas'),
  CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required').default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  BODY_LIMIT: z.string().default('10mb'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const formattedErrors = parseResult.error.issues
    .map((issue) => `  - [${issue.path.join('.') || 'root'}]: ${issue.message}`)
    .join('\n');

  console.error(`\n[CRITICAL] Environment configuration validation failed:\n${formattedErrors}\n`);
  throw new Error('Invalid environment configuration. Check your .env file against .env.example.');
}

/**
 * Immutable application configuration object.
 */
export const config = Object.freeze({
  port: parseResult.data.PORT,
  mongoUri: parseResult.data.MONGO_URI,
  clientOrigin: parseResult.data.CLIENT_ORIGIN,
  nodeEnv: parseResult.data.NODE_ENV,
  isProduction: parseResult.data.NODE_ENV === 'production',
  isTest: parseResult.data.NODE_ENV === 'test',
  rateLimitWindowMs: parseResult.data.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: parseResult.data.RATE_LIMIT_MAX,
  bodyLimit: parseResult.data.BODY_LIMIT,
});
