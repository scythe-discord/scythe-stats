import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;
let caller: ReturnType<typeof createCaller>;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  caller = createCaller({ db: testDb.db });
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

describe('reference router', () => {
  it('lists factions ordered by position', async () => {
    const factions = await caller.reference.factions();
    expect(factions).toHaveLength(7);
    expect(factions[0]?.position).toBe(1);
  });

  it('lists player mats, tiers, and bid presets', async () => {
    expect(await caller.reference.playerMats()).toHaveLength(7);
    expect(await caller.reference.tiers()).toHaveLength(7);
    expect(await caller.reference.bidPresets()).toHaveLength(5);
  });

  it('fetches a single faction by id', async () => {
    const polania = await caller.reference.faction({ id: 1 });
    expect(polania?.name).toBe('Polania');
  });

  it('returns null for an unknown faction id', async () => {
    expect(await caller.reference.faction({ id: 9999 })).toBeNull();
  });
});
