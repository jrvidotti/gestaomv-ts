import type { Config } from 'drizzle-kit';

export default {
  schema: './src/shared/schemas/**/*.ts',
  out: './src/server/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './data/database.sqlite',
  },
} satisfies Config;
