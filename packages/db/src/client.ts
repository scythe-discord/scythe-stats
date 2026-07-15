import { createServerEnv } from '@scythe/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as relations from './relations';
import * as schema from './schema';

const fullSchema = { ...schema, ...relations };

/**
 * Build a Drizzle client for a given connection string. Used directly by tests
 * (pointing at a throwaway Testcontainers database) and indirectly by `getDb()`.
 */
export function createDb(connectionString: string) {
  // Remote (managed) Postgres needs TLS; local dev / Testcontainers does not.
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])/.test(connectionString);
  const ssl =
    !isLocal || /sslmode=(require|verify)/.test(connectionString)
      ? ('require' as const)
      : undefined;
  const client = postgres(connectionString, {
    // Keep the pool small and let idle connections close, so the database's
    // compute can auto-suspend during idle periods (and we avoid stale handles).
    max: 5,
    idle_timeout: 30,
    ssl,
  });
  return drizzle({ client, schema: fullSchema });
}

export type Database = ReturnType<typeof createDb>;

let cached: Database | undefined;

/** Lazily-constructed app singleton, validated against the server env. */
export function getDb(): Database {
  if (!cached) {
    cached = createDb(createServerEnv().DATABASE_URL);
  }
  return cached;
}
