import type { Config } from 'drizzle-kit';
import { env } from './src/configs/env';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  }
} satisfies Config; 
