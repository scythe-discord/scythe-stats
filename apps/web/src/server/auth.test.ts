import { user, userTrueskill } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { upsertDiscordUser } from './auth-user';
import { appRouter } from './root';
import { createCallerFactory } from './trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await setupTestDatabase();
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

describe('upsertDiscordUser', () => {
  it('creates a user with a default trueskill row', async () => {
    const id = await upsertDiscordUser(testDb.db, {
      discordId: 'd-1',
      username: 'Neo',
      discriminator: '0',
    });

    const [u] = await testDb.db.select().from(user).where(eq(user.id, id));
    expect(u?.username).toBe('Neo');

    const [ts] = await testDb.db.select().from(userTrueskill).where(eq(userTrueskill.userId, id));
    expect(ts?.mu).toBe(25);
    expect(ts?.sigma).toBeCloseTo(8.333, 2);
  });

  it('is idempotent on discordId and updates the username', async () => {
    const first = await upsertDiscordUser(testDb.db, {
      discordId: 'd-2',
      username: 'Old',
      discriminator: '0',
    });
    const second = await upsertDiscordUser(testDb.db, {
      discordId: 'd-2',
      username: 'New',
      discriminator: '1',
    });

    expect(second).toBe(first); // same row, not a duplicate
    const [u] = await testDb.db.select().from(user).where(eq(user.id, first));
    expect(u?.username).toBe('New');
    expect(u?.discriminator).toBe('1');

    // Still exactly one trueskill row for the user.
    const tsRows = await testDb.db
      .select()
      .from(userTrueskill)
      .where(eq(userTrueskill.userId, first));
    expect(tsRows).toHaveLength(1);
  });
});

describe('auth.me', () => {
  it('returns the session user with their avatar hash, or null when anonymous', async () => {
    const userId = await upsertDiscordUser(testDb.db, {
      discordId: 'd-7',
      username: 'Trin',
      discriminator: '0',
      avatarHash: 'abc123',
    });
    const sessionUser = { userId, discordId: 'd-7', username: 'Trin', discriminator: '0' };
    const authed = createCaller({ db: testDb.db, user: sessionUser });
    expect(await authed.auth.me()).toEqual({ ...sessionUser, avatarHash: 'abc123' });

    const anon = createCaller({ db: testDb.db });
    expect(await anon.auth.me()).toBeNull();
  });
});
