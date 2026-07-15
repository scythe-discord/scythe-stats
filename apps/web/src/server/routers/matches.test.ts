import { match, player, playerMatchResult } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;
let caller: ReturnType<typeof createCaller>;

async function seedMatch(date: string, winnerName: string, loserName: string) {
  const db = testDb.db;
  const [winner] = await db.insert(player).values({ displayName: winnerName }).returning();
  const [loser] = await db.insert(player).values({ displayName: loserName }).returning();
  const [m] = await db
    .insert(match)
    .values({ numRounds: 6, datePlayed: new Date(date) })
    .returning();
  await db.insert(playerMatchResult).values([
    { matchId: m!.id, playerId: winner!.id, factionId: 1, playerMatId: 1, coins: 50, rank: 1 },
    { matchId: m!.id, playerId: loser!.id, factionId: 2, playerMatId: 2, coins: 30, rank: 2 },
  ]);
  return m!;
}

beforeAll(async () => {
  testDb = await setupTestDatabase();
  caller = createCaller({ db: testDb.db });
  // Insert in non-chronological order to prove ordering is by datePlayed.
  await seedMatch('2024-02-01T00:00:00Z', 'Bob', 'Bystander');
  await seedMatch('2024-03-01T00:00:00Z', 'Carol', 'Bystander2');
  await seedMatch('2024-01-01T00:00:00Z', 'Alice', 'Bystander3');
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

describe('matches.list', () => {
  it('returns matches newest-first with results and a derived winner', async () => {
    const page = await caller.matches.list({ first: 2 });

    expect(page.edges).toHaveLength(2);
    expect(page.edges[0]?.node.winner?.player?.displayName).toBe('Carol'); // 2024-03
    expect(page.edges[1]?.node.winner?.player?.displayName).toBe('Bob'); // 2024-02
    expect(page.edges[0]?.node.results).toHaveLength(2);
    expect(page.pageInfo.hasNextPage).toBe(true);
  });

  it('paginates with the endCursor', async () => {
    const first = await caller.matches.list({ first: 2 });
    const second = await caller.matches.list({
      first: 2,
      cursor: first.pageInfo.endCursor ?? undefined,
    });

    expect(second.edges).toHaveLength(1);
    expect(second.edges[0]?.node.winner?.player?.displayName).toBe('Alice'); // 2024-01
    expect(second.pageInfo.hasNextPage).toBe(false);
  });
});
