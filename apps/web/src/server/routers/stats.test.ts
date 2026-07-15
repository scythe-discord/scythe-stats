import { matComboTier, match, player, playerMatchResult } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;
let caller: ReturnType<typeof createCaller>;
const ids: Record<string, number> = {};

type Row = { name: string; f: number; m: number; coins: number; rank: number };

async function seedMatch(numRounds: number, rows: Row[]) {
  const db = testDb.db;
  const [m] = await db
    .insert(match)
    .values({ numRounds, datePlayed: new Date('2024-01-01') })
    .returning();
  await db.insert(playerMatchResult).values(
    rows.map((r) => ({
      matchId: m!.id,
      playerId: ids[r.name]!,
      factionId: r.f,
      playerMatId: r.m,
      coins: r.coins,
      rank: r.rank,
      tieOrder: 0,
    })),
  );
}

beforeAll(async () => {
  testDb = await setupTestDatabase();
  caller = createCaller({ db: testDb.db });

  for (const name of ['P1', 'P2', 'P3', 'P4']) {
    const [p] = await testDb.db.insert(player).values({ displayName: name }).returning();
    ids[name] = p!.id;
  }

  // A (2p, 6r): P1[f1/m1] wins.   B (2p, 8r): P1[f1/m1] wins.
  // C (3p, 5r): P2[f1/m1] wins.   D (2p, 7r): P3[f2/m2] wins, P1[f1/m1] loses.
  await seedMatch(6, [
    { name: 'P1', f: 1, m: 1, coins: 50, rank: 1 },
    { name: 'P2', f: 2, m: 2, coins: 30, rank: 2 },
  ]);
  await seedMatch(8, [
    { name: 'P1', f: 1, m: 1, coins: 40, rank: 1 },
    { name: 'P3', f: 2, m: 2, coins: 20, rank: 2 },
  ]);
  await seedMatch(5, [
    { name: 'P2', f: 1, m: 1, coins: 60, rank: 1 },
    { name: 'P1', f: 2, m: 2, coins: 30, rank: 2 },
    { name: 'P4', f: 3, m: 3, coins: 10, rank: 3 },
  ]);
  await seedMatch(7, [
    { name: 'P3', f: 2, m: 2, coins: 55, rank: 1 },
    { name: 'P1', f: 1, m: 1, coins: 25, rank: 2 },
  ]);

  // Tier list: combo (f1,m1) → tier "S" (id 2), combo (f2,m2) → tier "A" (id 3).
  await testDb.db.insert(matComboTier).values([
    { tierId: 2, factionId: 1, playerMatId: 1 },
    { tierId: 3, factionId: 2, playerMatId: 2 },
  ]);
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

const byFaction = (rows: { factionId: number }[], id: number) =>
  rows.find((r) => r.factionId === id)!;

describe('stats.factionStats', () => {
  it('aggregates wins and matches per faction', async () => {
    const rows = await caller.stats.factionStats({});
    expect(rows).toHaveLength(7); // one row per seeded faction
    expect(byFaction(rows, 1)).toMatchObject({ totalMatches: 4, totalWins: 3 });
    expect(byFaction(rows, 2)).toMatchObject({ totalMatches: 4, totalWins: 1 });
    expect(byFaction(rows, 3)).toMatchObject({ totalMatches: 1, totalWins: 0 });
  });

  it('filters by player count', async () => {
    const twoP = await caller.stats.factionStats({ playerCounts: [2] });
    expect(byFaction(twoP, 1)).toMatchObject({ totalMatches: 3, totalWins: 2 });
    expect(byFaction(twoP, 2)).toMatchObject({ totalMatches: 3, totalWins: 1 });
    expect(byFaction(twoP, 3)).toMatchObject({ totalMatches: 0, totalWins: 0 });

    const threeP = await caller.stats.factionStats({ playerCounts: [3] });
    expect(byFaction(threeP, 1)).toMatchObject({ totalMatches: 1, totalWins: 1 });
    expect(byFaction(threeP, 3)).toMatchObject({ totalMatches: 1, totalWins: 0 });
  });
});

describe('stats.factionStatsByPlayerCount', () => {
  it('returns one row per (faction, player count) cell with totals and wins', async () => {
    const rows = await caller.stats.factionStatsByPlayerCount();
    const cell = (f: number, pc: number) =>
      rows.find((r) => r.factionId === f && r.playerCount === pc);

    expect(cell(1, 2)).toMatchObject({ totalMatches: 3, totalWins: 2 });
    expect(cell(1, 3)).toMatchObject({ totalMatches: 1, totalWins: 1 });
    expect(cell(2, 2)).toMatchObject({ totalMatches: 3, totalWins: 1 });
    expect(cell(2, 3)).toMatchObject({ totalMatches: 1, totalWins: 0 });
    expect(cell(3, 3)).toMatchObject({ totalMatches: 1, totalWins: 0 });
    // Cells with no recorded games are simply absent.
    expect(cell(3, 2)).toBeUndefined();
  });
});

describe('stats.comboStats', () => {
  it('computes per-combo totals and win stats', async () => {
    const rows = await caller.stats.comboStats({});
    const f1m1 = rows.find((r) => r.factionId === 1 && r.playerMatId === 1)!;
    expect(f1m1.totalMatches).toBe(4);
    expect(f1m1.totalWins).toBe(3);
    expect(f1m1.avgCoinsOnWin).toBe(50); // floor((50+40+60)/3)
    expect(f1m1.avgRoundsOnWin).toBeCloseTo((6 + 8 + 5) / 3, 5);
    expect(f1m1.leastRoundsForWin).toBe(5);

    const f2m2 = rows.find((r) => r.factionId === 2 && r.playerMatId === 2)!;
    expect(f2m2).toMatchObject({
      totalMatches: 4,
      totalWins: 1,
      avgCoinsOnWin: 55,
      avgRoundsOnWin: 7,
      leastRoundsForWin: 7,
    });

    // A combo with appearances but no wins yields zeros / null.
    const f3m3 = rows.find((r) => r.factionId === 3 && r.playerMatId === 3)!;
    expect(f3m3).toMatchObject({
      totalMatches: 1,
      totalWins: 0,
      avgCoinsOnWin: 0,
      leastRoundsForWin: null,
    });
  });
});

describe('stats.tierList', () => {
  it('groups combos under their tiers, ordered by rank', async () => {
    const tiers = await caller.stats.tierList();
    expect(tiers).toHaveLength(7);
    expect(tiers.map((t) => t.name)).toEqual(['SS', 'S', 'A', 'B', 'C', 'D', 'F']);
    expect(tiers.find((t) => t.name === 'S')!.combos).toEqual([{ factionId: 1, playerMatId: 1 }]);
    expect(tiers.find((t) => t.name === 'A')!.combos).toEqual([{ factionId: 2, playerMatId: 2 }]);
    expect(tiers.find((t) => t.name === 'SS')!.combos).toEqual([]);
  });
});

describe('stats.topPlayers', () => {
  it('ranks players by wins for a faction', async () => {
    const top = await caller.stats.topPlayers({ factionId: 1, first: 10 });
    expect(top.map((t) => ({ name: t.player.displayName, wins: t.totalWins }))).toEqual([
      { name: 'P1', wins: 2 },
      { name: 'P2', wins: 1 },
    ]);
  });

  it('narrows to a mat combo and respects player counts', async () => {
    const combo = await caller.stats.topPlayers({ factionId: 1, playerMatId: 1, first: 10 });
    expect(combo.map((t) => t.player.displayName)).toEqual(['P1', 'P2']);

    // P2's only f1 win was a 3-player game, so it drops out under playerCounts [2].
    const twoP = await caller.stats.topPlayers({ factionId: 1, first: 10, playerCounts: [2] });
    expect(twoP.map((t) => ({ name: t.player.displayName, wins: t.totalWins }))).toEqual([
      { name: 'P1', wins: 2 },
    ]);
  });
});

// The two cases the legacy "max raw coins with tieOrder 0" definition got
// wrong. Seeded last (factions 4-7, untouched above) so the earlier
// hand-computed expectations stay valid.
describe('win definition (rank = 1)', () => {
  beforeAll(async () => {
    // Tied top coins, both rows left at tieOrder 0 — exactly how legacy data
    // (and every pre-fix insert) looks. Only the rank-1 row is the winner.
    await seedMatch(6, [
      { name: 'P1', f: 4, m: 4, coins: 55, rank: 1 },
      { name: 'P2', f: 5, m: 5, coins: 55, rank: 2 },
    ]);
    // Bid-game shape: ranks follow coins − bid, so the recorded winner can
    // trail on raw coins (here 29 beats 30 after a larger bid).
    await seedMatch(9, [
      { name: 'P3', f: 6, m: 6, coins: 29, rank: 1 },
      { name: 'P4', f: 7, m: 7, coins: 30, rank: 2 },
    ]);
  });

  it('counts a tied top score as a single win, for the rank-1 row', async () => {
    const rows = await caller.stats.factionStats({});
    expect(byFaction(rows, 4)).toMatchObject({ totalMatches: 1, totalWins: 1 });
    expect(byFaction(rows, 5)).toMatchObject({ totalMatches: 1, totalWins: 0 });
  });

  it('credits the bid-adjusted winner, not the raw-coins leader', async () => {
    const rows = await caller.stats.factionStats({});
    expect(byFaction(rows, 6)).toMatchObject({ totalMatches: 1, totalWins: 1 });
    expect(byFaction(rows, 7)).toMatchObject({ totalMatches: 1, totalWins: 0 });
  });
});
