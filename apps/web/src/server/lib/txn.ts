import type { Database } from '@scythe/db';

/** The transaction executor handed to a `db.transaction` callback. */
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

// Concurrent writers in a SERIALIZABLE transaction can fail with a serialization
// error (40001) or deadlock (40P01) and must be retried; other errors are real.
const MAX_RETRIES = 5;
const MAX_RETRY_DELAY_MS = 1500;

function isRetryablePgError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err.code === '40001' || err.code === '40P01')
  );
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `fn` in a SERIALIZABLE transaction, retrying on serialization failures. */
export async function runSerializable<T>(db: Database, fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.transaction(fn, { isolationLevel: 'serializable' });
    } catch (err) {
      if (isRetryablePgError(err) && attempt < MAX_RETRIES - 1) {
        await delay(Math.random() * MAX_RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
}
