import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schemas.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './data/database.sqlite',
  },
} satisfies Config;
