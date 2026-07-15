import { match, player, playerMatchResult } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;
let caller: ReturnType<typeof createCaller>;
const ids: Record<string, number> = {};

type Result = {
  name: string;
  factionId: number;
  playerMatId: number;
  coins: number;
  rank: number;
  tieOrder?: number;
};

async function seedMatch(date: string, results: Result[]) {
  const db = testDb.db;
  const [m] = await db
    .insert(match)
    .values({ numRounds: 6, datePlayed: new Date(date) })
    .returning();
  await db.insert(playerMatchResult).values(
    results.map((r) => ({
      matchId: m!.id,
      playerId: ids[r.name]!,
      factionId: r.factionId,
      playerMatId: r.playerMatId,
      coins: r.coins,
      rank: r.rank,
      tieOrder: r.tieOrder ?? 0,
    })),
  );
}

beforeAll(async () => {
  testDb = await setupTestDatabase();
  caller = createCaller({ db: testDb.db });

  for (const name of ['Alice', 'Bob', 'Carol']) {
    const [p] = await testDb.db.insert(player).values({ displayName: name }).returning();
    ids[name] = p!.id;
  }

  // Match 1: Alice wins (faction 1) over Bob.
  await seedMatch('2024-01-01T00:00:00Z', [
    { name: 'Alice', factionId: 1, playerMatId: 1, coins: 50, rank: 1 },
    { name: 'Bob', factionId: 2, playerMatId: 2, coins: 30, rank: 2 },
  ]);
  // Match 2: Alice (faction 2) and Carol both have max coins (40), but Carol has
  // tieOrder 1, so Alice is the sole winner.
  await seedMatch('2024-02-01T00:00:00Z', [
    { name: 'Alice', factionId: 2, playerMatId: 1, coins: 40, rank: 1, tieOrder: 0 },
    { name: 'Carol', factionId: 3, playerMatId: 2, coins: 40, rank: 2, tieOrder: 1 },
  ]);
  // Match 3: Bob wins over Alice.
  await seedMatch('2024-03-01T00:00:00Z', [
    { name: 'Bob', factionId: 1, playerMatId: 1, coins: 60, rank: 1 },
    { name: 'Alice', factionId: 2, playerMatId: 2, coins: 20, rank: 2 },
  ]);
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

describe('players.byId', () => {
  it('returns the player or null', async () => {
    expect((await caller.players.byId({ id: ids.Alice! }))?.displayName).toBe('Alice');
    expect(await caller.players.byId({ id: 999_999 })).toBeNull();
  });
});

describe('players.byName', () => {
  it('matches case-insensitively, ordered by name', async () => {
    const found = await caller.players.byName({ startsWith: 'a' });
    expect(found.map((p) => p.displayName)).toEqual(['Alice', 'Carol']);
  });
});

describe('players.totalWins', () => {
  it('counts only un-tied top scores', async () => {
    expect(await caller.players.totalWins({ playerId: ids.Alice! })).toBe(2);
    expect(await caller.players.totalWins({ playerId: ids.Bob! })).toBe(1);
    // Carol tied on coins but lost the tiebreak — not a win.
    expect(await caller.players.totalWins({ playerId: ids.Carol! })).toBe(0);
  });

  it('filters by faction', async () => {
    expect(await caller.players.totalWins({ playerId: ids.Alice!, factionId: 1 })).toBe(1);
    expect(await caller.players.totalWins({ playerId: ids.Alice!, factionId: 2 })).toBe(1);
  });

  it('filters by fromDate', async () => {
    expect(
      await caller.players.totalWins({ playerId: ids.Alice!, fromDate: '2024-02-01T00:00:00Z' }),
    ).toBe(1);
  });
});

describe('players.totalMatches', () => {
  it('counts every result the player appears in', async () => {
    expect(await caller.players.totalMatches({ playerId: ids.Alice! })).toBe(3);
    expect(await caller.players.totalMatches({ playerId: ids.Bob! })).toBe(2);
    expect(await caller.players.totalMatches({ playerId: ids.Carol! })).toBe(1);
  });
});

describe('players.byWins', () => {
  it('ranks players by win count, excluding the winless', async () => {
    const page = await caller.players.byWins({ first: 10 });
    expect(page.edges.map((e) => ({ name: e.node.displayName, wins: e.node.playerWins }))).toEqual([
      { name: 'Alice', wins: 2 },
      { name: 'Bob', wins: 1 },
    ]);
    expect(page.pageInfo.hasNextPage).toBe(false);
  });

  it('paginates with the offset cursor', async () => {
    const first = await caller.players.byWins({ first: 1 });
    expect(first.edges[0]?.node.displayName).toBe('Alice');
    expect(first.pageInfo.hasNextPage).toBe(true);

    const second = await caller.players.byWins({
      first: 1,
      after: first.pageInfo.endCursor ?? undefined,
    });
    expect(second.edges[0]?.node.displayName).toBe('Bob');
    expect(second.pageInfo.hasNextPage).toBe(false);
    expect(second.pageInfo.hasPreviousPage).toBe(true);
  });
});
