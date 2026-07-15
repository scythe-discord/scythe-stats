import { discordBlacklist, match, player, playerMatchResult, user } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

const RECORDER = { userId: 1, discordId: 'discord-123', username: 'Recorder', discriminator: '0' };

let testDb: TestDatabase;
let caller: ReturnType<typeof createCaller>;
let anon: ReturnType<typeof createCaller>;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  caller = createCaller({ db: testDb.db, user: RECORDER });
  anon = createCaller({ db: testDb.db });
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

const twoPlayers = (winner: string, loser: string) => ({
  numRounds: 6,
  datePlayed: '2024-05-01T00:00:00Z',
  results: [
    { displayName: winner, faction: 'Polania', playerMat: 'Industrial', coins: 50, rank: 1 },
    { displayName: loser, faction: 'Saxony', playerMat: 'Engineering', coins: 30, rank: 2 },
  ],
});

describe('matches.log', () => {
  it('rejects anonymous callers', async () => {
    await expect(anon.matches.log(twoPlayers('A', 'B'))).rejects.toThrow(/logged in/i);
  });

  it('rejects a blacklisted recorder', async () => {
    await testDb.db.insert(discordBlacklist).values({ discordId: 'banned-1' });
    const banned = createCaller({
      db: testDb.db,
      user: { userId: 2, discordId: 'banned-1', username: 'Bad', discriminator: '0' },
    });
    await expect(banned.matches.log(twoPlayers('C', 'D'))).rejects.toThrow(/flagged/i);
  });

  it('records a match, creating players and deriving the winner', async () => {
    const created = await caller.matches.log(twoPlayers('Ada', 'Linus'));

    expect(created.numRounds).toBe(6);
    expect(created.results).toHaveLength(2);
    expect(created.winner?.player?.displayName).toBe('Ada');
    expect(created.datePlayed).toBeInstanceOf(Date);

    const players = await testDb.db.select().from(player);
    expect(players.map((p) => p.displayName).sort()).toEqual(['Ada', 'Linus']);
  });

  it('reuses an existing player by display name rather than duplicating', async () => {
    await caller.matches.log(twoPlayers('Ada', 'Grace'));

    const adas = await testDb.db.select().from(player).where(eq(player.displayName, 'Ada'));
    expect(adas).toHaveLength(1);
  });

  it('rejects an unknown faction with the legacy message', async () => {
    await expect(
      caller.matches.log({
        numRounds: 6,
        datePlayed: '2024-05-02T00:00:00Z',
        results: [
          { displayName: 'X', faction: 'Atlantean', playerMat: 'Industrial', coins: 40, rank: 1 },
          { displayName: 'Y', faction: 'Saxony', playerMat: 'Engineering', coins: 20, rank: 2 },
        ],
      }),
    ).rejects.toThrow(/Faction with name Atlantean not found/);
  });

  it('rejects a match where rank and coins disagree', async () => {
    await expect(
      caller.matches.log({
        numRounds: 6,
        datePlayed: '2024-05-03T00:00:00Z',
        results: [
          { displayName: 'A', faction: 'Polania', playerMat: 'Industrial', coins: 10, rank: 1 },
          { displayName: 'B', faction: 'Saxony', playerMat: 'Engineering', coins: 99, rank: 2 },
        ],
      }),
    ).rejects.toThrow(/Rank and coins data do not align/);
  });

  it('merges a floating player into a newly identified (steamId) player', async () => {
    // A pre-existing floating player (no steamId) with a prior match result.
    const [floating] = await testDb.db.insert(player).values({ displayName: 'Mo' }).returning();
    const [oldMatch] = await testDb.db
      .insert(match)
      .values({ numRounds: 5, datePlayed: new Date('2024-01-01') })
      .returning();
    await testDb.db.insert(playerMatchResult).values({
      matchId: oldMatch!.id,
      playerId: floating!.id,
      factionId: 3,
      playerMatId: 3,
      coins: 10,
      rank: 1,
    });

    await caller.matches.log({
      numRounds: 6,
      datePlayed: '2024-06-01T00:00:00Z',
      results: [
        {
          displayName: 'Mo',
          steamId: 'STEAM_1',
          faction: 'Polania',
          playerMat: 'Industrial',
          coins: 40,
          rank: 1,
        },
        { displayName: 'Bea', faction: 'Saxony', playerMat: 'Engineering', coins: 20, rank: 2 },
      ],
    });

    // The floating Mo is gone; only the identified Mo remains...
    const mos = await testDb.db.select().from(player).where(eq(player.displayName, 'Mo'));
    expect(mos).toHaveLength(1);
    expect(mos[0]!.steamId).toBe('STEAM_1');

    // ...and the old result was reassigned to that identified player.
    const oldResults = await testDb.db
      .select()
      .from(playerMatchResult)
      .where(eq(playerMatchResult.matchId, oldMatch!.id));
    expect(oldResults[0]!.playerId).toBe(mos[0]!.id);
  });

  it('never merges a user-linked player into a steam identity', async () => {
    // A player already claimed by a Discord user shares a display name with an
    // incoming steam identity — it must be left alone, not absorbed/deleted.
    const [u] = await testDb.db
      .insert(user)
      .values({ username: 'Kai', discordId: 'd-kai', discriminator: '0' })
      .returning();
    const [linked] = await testDb.db
      .insert(player)
      .values({ displayName: 'Kai', userId: u!.id })
      .returning();

    await caller.matches.log({
      numRounds: 6,
      datePlayed: '2024-07-02T00:00:00Z',
      results: [
        {
          displayName: 'Kai',
          steamId: 'STEAM_KAI',
          faction: 'Albion',
          playerMat: 'Patriotic',
          coins: 40,
          rank: 1,
        },
        { displayName: 'Rex', faction: 'Togawa', playerMat: 'Innovative', coins: 20, rank: 2 },
      ],
    });

    const kais = await testDb.db.select().from(player).where(eq(player.displayName, 'Kai'));
    expect(kais).toHaveLength(2);
    expect(kais.find((p) => p.id === linked!.id)?.userId).toBe(u!.id);
    expect(kais.find((p) => p.steamId === 'STEAM_KAI')?.userId).toBeNull();
  });
});
