import { discordBlacklist, player, playerMatchResult, user, userTrueskill } from '@scythe/db';
import { setupTestDatabase, type TestDatabase } from '@scythe/db/testing';
import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { SessionUser } from '../context';
import { appRouter } from '../root';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);

let testDb: TestDatabase;
const callers = new Map<number, ReturnType<typeof createCaller>>();
let anon: ReturnType<typeof createCaller>;
let viewer: ReturnType<typeof createCaller>; // any authed caller, for reads

// Two combos that admit a valid 2-player assignment (distinct factions + mats).
const COMBOS = [
  { factionId: 1, playerMatId: 1 },
  { factionId: 2, playerMatId: 2 },
];

async function makeUser(name: string) {
  const [u] = await testDb.db
    .insert(user)
    .values({ username: name, discordId: `d-${name}`, discriminator: '0' })
    .returning();
  const sessionUser: SessionUser = {
    userId: u!.id,
    discordId: u!.discordId,
    username: name,
    discriminator: '0',
  };
  callers.set(u!.id, createCaller({ db: testDb.db, user: sessionUser }));
  return u!.id;
}

let host: number;
let p2: number;
let p3: number;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  host = await makeUser('Host');
  p2 = await makeUser('Player2');
  p3 = await makeUser('Player3');
  anon = createCaller({ db: testDb.db });
  viewer = callers.get(host)!;
}, 120_000);

afterAll(async () => {
  await testDb?.teardown();
});

const hostCaller = () => callers.get(host)!;

/** Drive a started game to completion by having the active player bid each turn. */
async function playOutManualBids(bidGameId: number, coins: number) {
  for (let i = 0; i < COMBOS.length; i++) {
    const g = await viewer.bids.byId({ bidGameId });
    const active = g.players.find((pl) => pl.id === g.activePlayer?.id);
    if (!active?.userId) throw new Error('no active player');
    const open = g.combos.find((c) => !c.bid);
    if (!open) throw new Error('no open combo');
    await callers.get(active.userId)!.bids.bid({ bidGameId, comboId: open.id, coins: coins - i });
  }
}

describe('bids: lifecycle (manual bidding)', () => {
  it('runs create → join → settings → start → bid to BIDDING_FINISHED', async () => {
    const created = await hostCaller().bids.create();
    expect(created.status).toBe('CREATED');
    expect(created.players).toHaveLength(1);
    expect(created.host?.userId).toBe(host);
    const id = created.id;

    const joined = await callers.get(p2)!.bids.join({ bidGameId: id });
    expect(joined.players).toHaveLength(2);

    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });

    const started = await hostCaller().bids.start({ bidGameId: id });
    expect(started.status).toBe('BIDDING');
    expect(started.combos).toHaveLength(2);
    // Every player got a distinct turn order.
    const orders = started.players.map((pl) => pl.order).sort();
    expect(orders).toEqual([1, 2]);
    // A turn-based game has an active player.
    expect(started.activePlayer).not.toBeNull();

    await playOutManualBids(id, 10);

    const done = await viewer.bids.byId({ bidGameId: id });
    expect(done.status).toBe('BIDDING_FINISHED');
    expect(done.activePlayer).toBeNull();
    expect(done.combos.every((c) => !!c.bid)).toBe(true);
    expect(done.bidHistory).toHaveLength(2);
  });
});

describe('bids: record results (ranked)', () => {
  it('records a finished ranked game: links a match, updates ratings, marks recorded', async () => {
    const created = await hostCaller().bids.create();
    const id = created.id;
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateRanked({ bidGameId: id, ranked: true });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    await hostCaller().bids.start({ bidGameId: id });
    await playOutManualBids(id, 10);

    const done = await viewer.bids.byId({ bidGameId: id });
    expect(done.status).toBe('BIDDING_FINISHED');

    // Results are ordered by finishing rank (winner first). Distinct coins so
    // the final scores (coins − bid) decrease down the list.
    const results = done.players.map((pl, idx) => ({
      bidGamePlayerId: pl.id,
      coins: 60 - idx * 20,
    }));
    const recorded = await hostCaller().bids.recordResults({
      bidGameId: id,
      numRounds: 12,
      datePlayed: new Date().toISOString(),
      results,
    });

    expect(recorded.status).toBe('GAME_RECORDED');
    expect(recorded.matchId).not.toBeNull();

    // Ranks follow the submitted order: results[0] (60 coins) placed 1st.
    const pmrs = await testDb.db
      .select()
      .from(playerMatchResult)
      .where(eq(playerMatchResult.matchId, recorded.matchId as number));
    expect(pmrs.find((r) => r.coins === 60)?.rank).toBe(1);
    expect(pmrs.find((r) => r.coins === 40)?.rank).toBe(2);

    const userIds = done.players.flatMap((pl) => (pl.userId != null ? [pl.userId] : []));
    const ts = await testDb.db
      .select()
      .from(userTrueskill)
      .where(inArray(userTrueskill.userId, userIds));
    expect(ts).toHaveLength(2);
    // Relative to the default mu of 25, the winner gained and the loser lost.
    expect(ts.some((t) => t.mu > 25)).toBe(true);
    expect(ts.some((t) => t.mu < 25)).toBe(true);
  });

  it('adopts a legacy name-keyed player row instead of duplicating it', async () => {
    // A pre-migration player row recorded by displayName, not linked to a user.
    const legacyUserId = await makeUser('LegacyBidder');
    const [floating] = await testDb.db
      .insert(player)
      .values({ displayName: 'LegacyBidder' })
      .returning();

    const { id } = await hostCaller().bids.create();
    await callers.get(legacyUserId)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    await hostCaller().bids.start({ bidGameId: id });
    await playOutManualBids(id, 10);

    const done = await viewer.bids.byId({ bidGameId: id });
    const results = done.players.map((pl, idx) => ({
      bidGamePlayerId: pl.id,
      coins: 60 - idx * 20,
    }));
    const recorded = await hostCaller().bids.recordResults({
      bidGameId: id,
      numRounds: 12,
      datePlayed: new Date().toISOString(),
      results,
    });

    // The floating row was linked to the user, not duplicated.
    const rows = await testDb.db
      .select()
      .from(player)
      .where(eq(player.displayName, 'LegacyBidder'));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(floating?.id);
    expect(rows[0]?.userId).toBe(legacyUserId);
    // And their match result landed on the adopted row.
    const pmrs = await testDb.db
      .select()
      .from(playerMatchResult)
      .where(eq(playerMatchResult.matchId, recorded.matchId as number));
    expect(pmrs.some((r) => r.playerId === floating?.id)).toBe(true);
  });

  it('lets the recorder resolve ties by ordering, and rejects orders that contradict scores', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    await hostCaller().bids.start({ bidGameId: id });
    await playOutManualBids(id, 10); // bids: 10 for the first actor, 9 for the second

    const done = await viewer.bids.byId({ bidGameId: id });
    const [first, second] = done.players;
    const bidOf = (playerId: number) =>
      done.combos.find((c) => c.bid?.bidGamePlayerId === playerId)?.bid?.coins ?? 0;
    // Equal final scores (coins − bid): a genuine tie.
    const tie = [
      { bidGamePlayerId: first!.id, coins: 20 + bidOf(first!.id) },
      { bidGamePlayerId: second!.id, coins: 20 + bidOf(second!.id) },
    ];

    // An order that contradicts the finals is rejected outright.
    await expect(
      hostCaller().bids.recordResults({
        bidGameId: id,
        numRounds: 12,
        datePlayed: new Date().toISOString(),
        results: [
          { bidGamePlayerId: first!.id, coins: 5 + bidOf(first!.id) },
          { bidGamePlayerId: second!.id, coins: 20 + bidOf(second!.id) },
        ],
      }),
    ).rejects.toThrow(/do not align/i);

    // The recorder puts `second` first: they win the tie.
    const recorded = await hostCaller().bids.recordResults({
      bidGameId: id,
      numRounds: 12,
      datePlayed: new Date().toISOString(),
      results: [tie[1]!, tie[0]!],
    });
    const pmrs = await testDb.db
      .select()
      .from(playerMatchResult)
      .where(eq(playerMatchResult.matchId, recorded.matchId as number));
    expect(pmrs.find((r) => r.coins === tie[1]!.coins)?.rank).toBe(1);
    expect(pmrs.find((r) => r.coins === tie[0]!.coins)?.rank).toBe(2);
  });

  it('rejects recorders flagged in the Discord blacklist', async () => {
    const flagged = await makeUser('FlaggedRecorder');
    await testDb.db.insert(discordBlacklist).values({ discordId: 'd-FlaggedRecorder' });

    const { id } = await hostCaller().bids.create();
    await callers.get(flagged)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    await hostCaller().bids.start({ bidGameId: id });
    await playOutManualBids(id, 10);

    await expect(
      callers.get(flagged)!.bids.recordResults({
        bidGameId: id,
        numRounds: 12,
        datePlayed: new Date().toISOString(),
        results: [
          { bidGamePlayerId: 1, coins: 50 },
          { bidGamePlayerId: 2, coins: 20 },
        ],
      }),
    ).rejects.toThrow(/flagged/i);
  });

  it('rejects recording a game that is not BIDDING_FINISHED', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await expect(
      hostCaller().bids.recordResults({
        bidGameId: id,
        numRounds: 10,
        datePlayed: new Date().toISOString(),
        results: [
          { bidGamePlayerId: 1, coins: 10 },
          { bidGamePlayerId: 2, coins: 5 },
        ],
      }),
    ).rejects.toThrow(/not ready/i);
  });
});

describe('bids: quick bidding', () => {
  it('resolves once every player submits quick bids', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateQuickBid({ bidGameId: id, quickBid: true });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    const started = await hostCaller().bids.start({ bidGameId: id });
    expect(started.activePlayer).toBeNull(); // quick-bid games have no turn order

    const [c1, c2] = started.combos;
    const qbFor = (firstCoins: number, secondCoins: number) => [
      { comboId: c1!.id, bidCoins: firstCoins, order: 0 },
      { comboId: c2!.id, bidCoins: secondCoins, order: 1 },
    ];

    const afterFirst = await hostCaller().bids.quickBid({ bidGameId: id, quickBids: qbFor(10, 2) });
    expect(afterFirst.status).toBe('BIDDING'); // not everyone has submitted yet

    // Sealed bids must never reach clients — only a readiness flag (any caller,
    // it's a public query).
    const midGame = await anon.bids.byId({ bidGameId: id });
    const hostPlayer = midGame.players.find((pl) => pl.userId === host);
    const otherPlayer = midGame.players.find((pl) => pl.userId === p2);
    expect(hostPlayer?.quickBidReady).toBe(true);
    expect(otherPlayer?.quickBidReady).toBe(false);
    for (const pl of [...midGame.players, midGame.host, midGame.activePlayer]) {
      expect(pl ? 'quickBids' in pl : false).toBe(false);
    }

    const afterSecond = await callers
      .get(p2)!
      .bids.quickBid({ bidGameId: id, quickBids: qbFor(3, 9) });
    expect(afterSecond.status).toBe('BIDDING_FINISHED');
    expect(afterSecond.combos.every((c) => !!c.bid)).toBe(true);
    // Each combo went to a different player.
    const bidderIds = new Set(afterSecond.combos.map((c) => c.bid?.bidGamePlayerId));
    expect(bidderIds.size).toBe(2);
  });

  it('keeps sealed quick bids out of the public match list after recording', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateQuickBid({ bidGameId: id, quickBid: true });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    const started = await hostCaller().bids.start({ bidGameId: id });
    const [c1, c2] = started.combos;
    const qb = (a: number, b: number) => [
      { comboId: c1!.id, bidCoins: a, order: 0 },
      { comboId: c2!.id, bidCoins: b, order: 1 },
    ];
    await hostCaller().bids.quickBid({ bidGameId: id, quickBids: qb(10, 2) });
    const finished = await callers.get(p2)!.bids.quickBid({ bidGameId: id, quickBids: qb(3, 9) });
    expect(finished.status).toBe('BIDDING_FINISHED');

    // Everyone banks 30 raw coins, submitted in final-score (coins − bid) order.
    const bidOf = (playerId: number) =>
      finished.combos.find((c) => c.bid?.bidGamePlayerId === playerId)?.bid?.coins ?? 0;
    const ordered = [...finished.players].sort((a, b) => bidOf(a.id) - bidOf(b.id));
    const recorded = await hostCaller().bids.recordResults({
      bidGameId: id,
      numRounds: 11,
      datePlayed: new Date().toISOString(),
      results: ordered.map((pl) => ({ bidGamePlayerId: pl.id, coins: 30 })),
    });
    expect(recorded.matchId).not.toBeNull();

    // The public match list exposes the winning bid but never the sealed sheets.
    const page = await anon.matches.list({ first: 50 });
    const bidGamePlayers = page.edges
      .flatMap((e) => e.node.results)
      .map((r) => r.bidGamePlayer)
      .filter((bgp) => bgp != null);
    expect(bidGamePlayers.length).toBeGreaterThan(0);
    for (const bgp of bidGamePlayers) {
      expect('quickBids' in bgp).toBe(false);
    }
    expect(bidGamePlayers.some((bgp) => bgp.bid != null)).toBe(true);
  });
});

describe('bids: guards', () => {
  it('requires auth to create', async () => {
    await expect(anon.bids.create()).rejects.toThrow(/logged in/i);
  });

  it('enforces host-only settings and start', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });

    await expect(
      callers.get(p2)!.bids.updateSettings({ bidGameId: id, combos: COMBOS }),
    ).rejects.toThrow(/host/i);
    await expect(callers.get(p2)!.bids.start({ bidGameId: id })).rejects.toThrow(/host/i);
  });

  it('rejects joining a started game and double-joins', async () => {
    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await expect(callers.get(host)!.bids.join({ bidGameId: id })).rejects.toThrow(/already in/i);

    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    await hostCaller().bids.start({ bidGameId: id });
    await expect(callers.get(p3)!.bids.join({ bidGameId: id })).rejects.toThrow(/already started/i);
  });

  it('rejects bidding out of turn and starting without enough players', async () => {
    const solo = await hostCaller().bids.create();
    await hostCaller().bids.updateSettings({ bidGameId: solo.id, combos: COMBOS });
    await expect(hostCaller().bids.start({ bidGameId: solo.id })).rejects.toThrow(/not enough/i);

    const { id } = await hostCaller().bids.create();
    await callers.get(p2)!.bids.join({ bidGameId: id });
    await hostCaller().bids.updateSettings({ bidGameId: id, combos: COMBOS });
    const started = await hostCaller().bids.start({ bidGameId: id });
    const inactive = started.players.find((pl) => pl.id !== started.activePlayer?.id);
    const combo = started.combos[0]!;
    await expect(
      callers.get(inactive!.userId!)!.bids.bid({ bidGameId: id, comboId: combo.id, coins: 5 }),
    ).rejects.toThrow(/your turn/i);
  });
});
