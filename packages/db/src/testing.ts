import { fileURLToPath } from 'node:url';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb, type Database } from './client';
import { seedReferenceData } from './seed';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

export interface TestDatabase {
  db: Database;
  teardown: () => Promise<void>;
}

/**
 * Spin up a throwaway Postgres (Testcontainers), apply migrations, and (by
 * default) seed reference data. Shared by every package's integration tests.
 */
export async function setupTestDatabase(opts: { seed?: boolean } = {}): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();
  const db = createDb(container.getConnectionUri());
  await migrate(db, { migrationsFolder });
  if (opts.seed !== false) {
    await seedReferenceData(db);
  }
  return {
    db,
    teardown: async () => {
      await db.$client.end();
      await container.stop();
    },
  };
}
