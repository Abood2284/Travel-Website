import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'NEON_DATABASE_URL is not set. Provide it before running Drizzle commands.'
  );
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  casing: 'snake_case',
});
