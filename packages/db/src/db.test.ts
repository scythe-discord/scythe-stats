import { fileURLToPath } from 'node:url';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, type Database } from './client';
import * as schema from './schema';
import { seedReferenceData } from './seed';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

/** Unwrap the first row of a `.returning()` (defeats noUncheckedIndexedAccess). */
function first<T>(rows: T[]): T {
  const row = rows[0];
  if (!row) throw new Error('expected at least one row');
  return row;
}

let container: StartedPostgreSqlContainer;
let db: Database;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17-alpine').start();
  db = createDb(container.getConnectionUri());
  await migrate(db, { migrationsFolder });
  await seedReferenceData(db);
}, 120_000);

afterAll(async () => {
  await db?.$client.end();
  await container?.stop();
});

describe('migration + seed', () => {
  it('seeds the reference data', async () => {
    const [factions, mats, tiers, presets] = await Promise.all([
      db.select().from(schema.faction),
      db.select().from(schema.playerMat),
      db.select().from(schema.tier),
      db.select().from(schema.bidPreset),
    ]);
    expect(factions).toHaveLength(7);
    expect(mats).toHaveLength(7);
    expect(tiers).toHaveLength(7);
    expect(presets).toHaveLength(5);
    expect(presets.filter((p) => p.default === true)).toHaveLength(1);
  });
});

describe('round-trip', () => {
  it('writes and reads a match with results via the relations API', async () => {
    const alice = first(
      await db.insert(schema.player).values({ displayName: 'Alice' }).returning(),
    );
    const bob = first(await db.insert(schema.player).values({ displayName: 'Bob' }).returning());
    const m = first(
      await db
        .insert(schema.match)
        .values({ numRounds: 6, datePlayed: new Date('2024-01-01T00:00:00Z') })
        .returning(),
    );
    await db.insert(schema.playerMatchResult).values([
      { matchId: m.id, playerId: alice.id, factionId: 1, playerMatId: 1, coins: 50, rank: 1 },
      { matchId: m.id, playerId: bob.id, factionId: 2, playerMatId: 2, coins: 40, rank: 2 },
    ]);

    const loaded = await db.query.match.findFirst({
      where: eq(schema.match.id, m.id),
      with: { results: { with: { player: true, faction: true } } },
    });

    expect(loaded?.results).toHaveLength(2);
    const winner = loaded?.results.find((r) => r.rank === 1);
    expect(winner?.coins).toBe(50);
    expect(winner?.player?.displayName).toBe('Alice');
    expect(winner?.faction?.name).toBe('Polania');
  });

  it('exposes numeric mu/sigma as JS numbers honouring the defaults', async () => {
    const u = first(
      await db
        .insert(schema.user)
        .values({ username: 'dave', discordId: 'discord-dave', discriminator: '0001' })
        .returning(),
    );
    const ts = first(await db.insert(schema.userTrueskill).values({ userId: u.id }).returning());
    expect(typeof ts.mu).toBe('number');
    expect(ts.mu).toBe(25);
    // numeric(7,2) rounds the 8.333... default to 8.33.
    expect(ts.sigma).toBeCloseTo(8.33, 2);
  });
});

describe('constraints', () => {
  it('rejects two results at the same rank in one match', async () => {
    const p1 = first(await db.insert(schema.player).values({ displayName: 'Erin' }).returning());
    const p2 = first(await db.insert(schema.player).values({ displayName: 'Frank' }).returning());
    const m = first(
      await db
        .insert(schema.match)
        .values({ numRounds: 5, datePlayed: new Date('2024-02-01T00:00:00Z') })
        .returning(),
    );
    await db
      .insert(schema.playerMatchResult)
      .values({ matchId: m.id, playerId: p1.id, factionId: 3, playerMatId: 3, coins: 30, rank: 1 });

    await expect(
      db.insert(schema.playerMatchResult).values({
        matchId: m.id,
        playerId: p2.id,
        factionId: 4,
        playerMatId: 4,
        coins: 20,
        rank: 1,
      }),
    ).rejects.toThrow();
  });
});
