// Standalone migration runner
//
// The Next.js standalone image intentionally omits drizzle-kit (a dev tool) and
// the migration SQL, so this tiny script applies pending migrations at deploy
// time using drizzle-orm's runtime migrator against DATABASE_URL. It shares the
// same `drizzle.__drizzle_migrations` bookkeeping table (and file-hash scheme)
// as `drizzle-kit migrate`.
//
// In the Docker image this file sits next to a `drizzle/` folder (the migration
// SQL + meta) and its own `node_modules` (postgres + drizzle-orm); see the
// `migrate` stage in the root Dockerfile. It reads DATABASE_URL directly (not
// via @scythe/config) so it needs none of the other server env vars.
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] DATABASE_URL is not set');
  process.exit(1);
}

// Mirror packages/db/src/client.ts: remote (managed) Postgres requires TLS.
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])/.test(url);
const ssl = !isLocal || /sslmode=(require|verify)/.test(url) ? 'require' : undefined;
const sql = postgres(url, { max: 1, ssl, onnotice: () => {} });

const migrationsFolder = join(import.meta.dirname, 'drizzle');
try {
  console.log(`[migrate] applying pending migrations from ${migrationsFolder}`);
  await migrate(drizzle(sql), { migrationsFolder });
  console.log('[migrate] database is up to date');
} catch (err) {
  console.error('[migrate] failed:', err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
