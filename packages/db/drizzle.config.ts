import { createServerEnv } from '@scythe/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: createServerEnv().DATABASE_URL },
  verbose: true,
  strict: true,
});
