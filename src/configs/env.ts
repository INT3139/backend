import dotenv from 'dotenv';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.url().nonempty(),
    REDIS_URL: z.url().nonempty(),
    JWT_SECRET: z.string().nonempty().min(32),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    SMTP_HOST: z.string().nonempty(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().nonempty(),
    SMTP_PASS: z.string().nonempty(),
    S3_ENDPOINT: z.url(),
    S3_BUCKET: z.string().default("hrm-files"),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
})

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsedEnv.data;
export type Env = typeof env;