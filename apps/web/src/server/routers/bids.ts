import {
  bidGame,
  bidGameCombo,
  bidGamePlayer,
  bidPreset,
  bidPresetSetting,
  bid as bidTable,
  type Combo,
  type Database,
  discordBlacklist,
  faction as factionTable,
  match as matchTable,
  type PlayerTrueskill,
  playerMatchResult,
  playerMat as playerMatTable,
  player as playerTable,
  type QuickBid,
  userTrueskill,
} from '@scythe/db';
import {
  assignCombos,
  computeRatingUpdate,
  getActivePlayerId,
  MAX_COINS,
  resolveQuickBids,
} from '@scythe/domain';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray, isNull, ne } from 'drizzle-orm';
import { z } from 'zod';
import { discordAvatarUrl } from '../../lib/discord';
import { bidGameUpdates, publishBidGameUpdated } from '../lib/bid-events';
import { type MatchLogEntry, postMatchLog } from '../lib/discord-log';
import { CREATE_RULE, GAME_RULE, RECORD_RULE } from '../lib/rate-limit';
import { runSerializable, type Tx } from '../lib/txn';
import { validateMatchInput } from '../lib/validate-match';
import { publicProcedure, rateLimitedProcedure, router } from '../trpc';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 7;

function bad(message: string): never {
  throw new TRPCError({ code: 'BAD_REQUEST', message });
}

/** Fisher–Yates shuffle (runtime randomness; tests assert invariants, not order). */
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

const bidGameWith = {
  players: { with: { user: true, bid: true } },
  combos: { with: { faction: true, playerMat: true, bid: true } },
  bidPreset: true,
  // Recorded games render the full match table (legacy MatchDetails parity).
  match: { with: { results: { with: { player: true, faction: true, playerMat: true } } } },
} as const;

/**
 * Load a bid game with everything the client needs, deriving the host and the
 * active player in memory (the host isn't a Drizzle relation — see relations.ts).
 * `exec` may be the db or a transaction; both expose `.query`.
 */
async function loadBidGame(exec: Pick<Database, 'query'>, bidGameId: number) {
  const game = await exec.query.bidGame.findFirst({
    where: eq(bidGame.id, bidGameId),
    with: bidGameWith,
  });
  if (!game) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Bid game not found' });
  }

  // Order by turn order, then join time (legacy ordering).
  const players = [...game.players].sort((a, b) => {
    if (a.order == null || b.order == null || a.order === b.order) {
      return a.dateJoined.getTime() - b.dateJoined.getTime();
    }
    return a.order - b.order;
  });

  const host = players.find((p) => p.id === game.hostId) ?? null;

  const activePlayerId = getActivePlayerId(
    players.map((p) => ({ id: p.id, order: p.order, hasBid: !!p.bid })),
    game.bidHistory.map((h) => h.playerId),
  );
  // Quick-bid games have no turn-based active player.
  const activePlayer = game.quickBid
    ? null
    : (players.find((p) => p.id === activePlayerId) ?? null);

  return { ...game, players, host, activePlayer };
}

type LoadedGame = Awaited<ReturnType<typeof loadBidGame>>;

/**
 * Client-facing projection of a loaded game. Sealed quick bids must stay
 * server-side until resolution — the legacy API exposed only a
 * `quickBidReady` boolean — so strip `quickBids` from every player (including
 * the host/activePlayer aliases, which point at the same objects). The user
 * relation is likewise cut down to what the UI renders (username + avatar):
 * these endpoints are public with sequential game ids, and the full row would
 * hand any anonymous visitor a username → Discord-id directory.
 */
function toClientGame(game: LoadedGame) {
  const players = game.players.map(({ quickBids, user, ...p }) => ({
    ...p,
    quickBidReady: !!quickBids,
    user: user
      ? {
          id: user.id,
          username: user.username,
          avatarUrl: discordAvatarUrl(user.discordId, user.discordAvatarHash),
        }
      : null,
  }));
  return {
    ...game,
    players,
    host: players.find((p) => p.id === game.host?.id) ?? null,
    activePlayer: players.find((p) => p.id === game.activePlayer?.id) ?? null,
  };
}

async function loadClientGame(exec: Pick<Database, 'query'>, bidGameId: number) {
  return toClientGame(await loadBidGame(exec, bidGameId));
}

/** Find the caller's player row in a game, or throw the legacy "must be in the game" error. */
function requirePlayer(game: LoadedGame, userId: number) {
  const player = game.players.find((p) => p.userId === userId);
  if (!player) bad('You must be in the game to bid');
  return player;
}

function requireHost(game: LoadedGame, userId: number) {
  if (game.host?.userId !== userId) bad('You must be the host to do that');
}

const comboInput = z.object({
  factionId: z.number().int().positive(),
  playerMatId: z.number().int().positive(),
});

const bidGameId = z.object({ bidGameId: z.number().int().positive() });

export const bidsRouter = router({
  byId: publicProcedure
    .input(bidGameId)
    .query(({ ctx, input }) => loadClientGame(ctx.db, input.bidGameId)),

  // Live updates for one game: emits the current state immediately, then again
  // on every published change (any player's mutation) until the client leaves.
  // SSE via httpSubscriptionLink; the fan-out is Redis-backed (see bid-events).
  onUpdate: publicProcedure.input(bidGameId).subscription(async function* ({ ctx, input, signal }) {
    // Subscribe-then-fetch: the update listener must be live before the
    // snapshot query runs, or a change committed in between is never delivered
    // and every viewer sits on a stale screen until they refresh.
    const updates = await bidGameUpdates(input.bidGameId, signal);
    yield await loadClientGame(ctx.db, input.bidGameId);
    for await (const _ of updates) {
      yield await loadClientGame(ctx.db, input.bidGameId);
    }
  }),

  create: rateLimitedProcedure('bid-create', CREATE_RULE).mutation(async ({ ctx }) => {
    const userId = ctx.user.userId;
    const id = await runSerializable(ctx.db, async (tx) => {
      const now = new Date();

      // Seed enabledCombos from the default preset's enabled settings (the
      // 245-row preset matrix may be unseeded, in which case this is empty and
      // the host sets combos via updateSettings before starting).
      const [preset] = await tx.select().from(bidPreset).where(eq(bidPreset.default, true));
      const enabledCombos = preset ? await enabledCombosForPreset(tx, preset.id) : [];

      const [game] = await tx
        .insert(bidGame)
        .values({
          createdAt: now,
          modifiedAt: now,
          bidPresetId: preset?.id ?? null,
          enabledCombos,
        })
        .returning({ id: bidGame.id });
      if (!game) throw new Error('Failed to create bid game');

      const [player] = await tx
        .insert(bidGamePlayer)
        .values({ bidGameId: game.id, userId, dateJoined: now })
        .returning({ id: bidGamePlayer.id });
      if (!player) throw new Error('Failed to create bid game player');

      await tx.update(bidGame).set({ hostId: player.id }).where(eq(bidGame.id, game.id));
      return game.id;
    });
    publishBidGameUpdated(id);
    return loadClientGame(ctx.db, id);
  }),

  join: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(bidGameId)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        if (game.status !== 'CREATED') bad('The game you are trying to join has already started');
        if (game.players.length >= MAX_PLAYERS) bad('The game you are trying to join is full');
        if (game.players.some((p) => p.userId === userId)) bad('You are already in this game');

        await tx
          .insert(bidGamePlayer)
          .values({ bidGameId: input.bidGameId, userId, dateJoined: new Date() });
        await touch(tx, input.bidGameId);
      });
      publishBidGameUpdated(input.bidGameId);
      return loadClientGame(ctx.db, input.bidGameId);
    }),

  updateSettings: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(
      bidGameId.extend({
        bidPresetId: z.number().int().positive().nullish(),
        combos: z.array(comboInput),
        timeLimit: z.number().int().positive().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        if (game.status !== 'CREATED') bad('That game has already started');
        requireHost(game, userId);
        await assertValidCombos(tx, input.combos);

        await tx
          .update(bidGame)
          .set({
            enabledCombos: input.combos,
            bidTimeLimitSeconds: input.timeLimit ?? null,
            bidPresetId: input.bidPresetId ?? null,
            modifiedAt: new Date(),
          })
          .where(eq(bidGame.id, input.bidGameId));
      });
      publishBidGameUpdated(input.bidGameId);
      return loadClientGame(ctx.db, input.bidGameId);
    }),

  updateQuickBid: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(bidGameId.extend({ quickBid: z.boolean() }))
    .mutation(({ ctx, input }) =>
      updateFlag(ctx.db, ctx.user.userId, input.bidGameId, { quickBid: input.quickBid }),
    ),

  updateRanked: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(bidGameId.extend({ ranked: z.boolean() }))
    .mutation(({ ctx, input }) =>
      updateFlag(ctx.db, ctx.user.userId, input.bidGameId, { ranked: input.ranked }),
    ),

  start: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(bidGameId)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        requireHost(game, userId);
        if (game.status !== 'CREATED') bad('That game has already started');
        if (game.players.length < MIN_PLAYERS) bad('Not enough players');
        if (game.players.length > MAX_PLAYERS) bad('Too many players');

        const chosen = assignCombos(game.players.length, shuffle(game.enabledCombos ?? []));
        if (!chosen) {
          bad(
            'No valid assignment of faction/player mat combinations found. Try choosing more combinations',
          );
        }

        await tx.insert(bidGameCombo).values(
          chosen.map((c) => ({
            bidGameId: input.bidGameId,
            factionId: c.factionId,
            playerMatId: c.playerMatId,
          })),
        );

        // Assign each player a random, distinct turn order 1..n.
        const orders = shuffle(game.players.map((_, idx) => idx + 1));
        await Promise.all(
          game.players.map((p, idx) =>
            tx.update(bidGamePlayer).set({ order: orders[idx] }).where(eq(bidGamePlayer.id, p.id)),
          ),
        );

        await tx
          .update(bidGame)
          .set({ status: 'BIDDING', modifiedAt: new Date() })
          .where(eq(bidGame.id, input.bidGameId));
      });
      publishBidGameUpdated(input.bidGameId);
      return loadClientGame(ctx.db, input.bidGameId);
    }),

  bid: rateLimitedProcedure('bid-game', GAME_RULE)
    // Coins bounded like every other scoring input (0..MAX_COINS): an unbounded
    // bid would flow into recorded results as an arbitrary penalty.
    .input(
      bidGameId.extend({
        comboId: z.number().int().positive(),
        coins: z.number().int().min(0).max(MAX_COINS),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        const player = requirePlayer(game, userId);

        if (!game.activePlayer) bad('An error has occurred');
        if (player.id !== game.activePlayer.id) bad('It is not your turn to bid');
        if (game.status !== 'BIDDING') bad('That game has already started');
        if (player.bid) bad('You already have an active bid');

        const combo = game.combos.find((c) => c.id === input.comboId);
        if (!combo) bad('That combo is not in this game');

        const now = new Date();
        if (combo.bid) {
          if (combo.bid.coins >= input.coins) {
            bad(`Your bid must be higher than the current bid of ${combo.bid.coins}`);
          }
          // Outbidding frees the previous bidder to bid again.
          await tx.delete(bidTable).where(eq(bidTable.id, combo.bid.id));
        }

        await tx.insert(bidTable).values({
          bidGameComboId: combo.id,
          bidGamePlayerId: player.id,
          coins: input.coins,
          date: now,
        });

        const finished = game.combos.every((c) => (c.id === combo.id ? true : !!c.bid));
        const bidHistory = [
          ...game.bidHistory,
          {
            coins: input.coins,
            date: now.toISOString(),
            factionId: combo.factionId as number,
            playerMatId: combo.playerMatId as number,
            playerId: player.id,
          },
        ];

        await tx
          .update(bidGame)
          .set({ status: finished ? 'BIDDING_FINISHED' : 'BIDDING', modifiedAt: now, bidHistory })
          .where(eq(bidGame.id, input.bidGameId));
      });
      publishBidGameUpdated(input.bidGameId);
      return loadClientGame(ctx.db, input.bidGameId);
    }),

  quickBid: rateLimitedProcedure('bid-game', GAME_RULE)
    .input(
      bidGameId.extend({
        quickBids: z
          .array(
            z.object({
              comboId: z.number().int().positive(),
              bidCoins: z.number().int().min(0).max(MAX_COINS),
              order: z.number().int(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        const player = requirePlayer(game, userId);

        if (!game.quickBid) bad('That game does not have quick bids enabled');
        if (game.status !== 'BIDDING') bad('That game has already started');
        if (player.quickBids) bad('You already have active bids');

        // One bid per combo, covering exactly the game's combos.
        const comboIds = new Set(game.combos.map((c) => c.id));
        if (input.quickBids.length !== comboIds.size) bad('Invalid quick bid format');
        const seen = new Set<number>();
        for (const qb of input.quickBids) {
          if (seen.has(qb.comboId) || !comboIds.has(qb.comboId)) bad('Invalid quick bid format');
          seen.add(qb.comboId);
        }

        const quickBids: QuickBid[] = input.quickBids.map((qb) => ({
          comboId: qb.comboId,
          bidCoins: qb.bidCoins,
          order: qb.order,
        }));
        await tx.update(bidGamePlayer).set({ quickBids }).where(eq(bidGamePlayer.id, player.id));

        // Once everyone has submitted, resolve all quick bids into final bids.
        const everyoneReady = game.players.every((p) => p.id === player.id || !!p.quickBids);
        if (everyoneReady) {
          const resolved = resolveQuickBids(
            game.players.map((p) => ({
              id: p.id,
              order: p.order,
              quickBids: p.id === player.id ? quickBids : (p.quickBids ?? []),
            })),
            game.combos.map((c) => c.id),
          );

          const now = new Date();
          for (const [comboId, { playerId, bidCoins }] of resolved) {
            await tx.insert(bidTable).values({
              bidGameComboId: comboId,
              bidGamePlayerId: playerId,
              coins: bidCoins,
              date: now,
            });
          }
          await tx
            .update(bidGame)
            .set({ status: 'BIDDING_FINISHED', modifiedAt: now })
            .where(eq(bidGame.id, input.bidGameId));
        } else {
          await touch(tx, input.bidGameId);
        }
      });
      publishBidGameUpdated(input.bidGameId);
      return loadClientGame(ctx.db, input.bidGameId);
    }),

  // Record the played match for a BIDDING_FINISHED game: `results` arrives in
  // finishing order (winner first) — the recorder resolves ties, as in the
  // legacy record-match modal ("winners of ties should come first"). Each
  // player's faction/mat and bid penalty come from the combo they hold, and
  // validateMatch rejects any ordering that contradicts the final scores
  // (coins − bid). For ranked games this also updates OpenSkill ratings and
  // expires the players' other finished ranked games (legacy
  // MatchRepository.logMatch port).
  // Shares the 'log-match' budget with matches.log: both feed the same stats.
  recordResults: rateLimitedProcedure('log-match', RECORD_RULE)
    .input(
      bidGameId.extend({
        numRounds: z.number().int().positive(),
        datePlayed: z.string().datetime(),
        // Announce to the configured Discord channels (legacy default: on).
        shouldPostMatchLog: z.boolean().default(true),
        // Ordered by finishing rank: results[0] is 1st place.
        results: z
          .array(
            z.object({
              bidGamePlayerId: z.number().int().positive(),
              coins: z.number().int().min(0),
            }),
          )
          .min(MIN_PLAYERS)
          .max(MAX_PLAYERS),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      // Legacy logMatch guard, shared with matches.log: flagged recorders
      // cannot record bid games either.
      const [flagged] = await ctx.db
        .select({ id: discordBlacklist.id })
        .from(discordBlacklist)
        .where(eq(discordBlacklist.discordId, ctx.user.discordId));
      if (flagged) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Your account has been flagged for recording matches',
        });
      }

      const logEntries = await runSerializable(ctx.db, async (tx) => {
        const game = await loadBidGame(tx, input.bidGameId);
        requirePlayer(game, userId);
        if (game.status !== 'BIDDING_FINISHED') bad('That game is not ready to be recorded');
        if (
          input.results.length !== game.players.length ||
          new Set(input.results.map((r) => r.bidGamePlayerId)).size !== input.results.length
        ) {
          bad('Provide a score for every player');
        }

        // Each player's held combo carries their faction/mat and bid penalty;
        // rank is the position the recorder gave them in `results`.
        const ranked = input.results.map((r, idx) => {
          const p = game.players.find((pl) => pl.id === r.bidGamePlayerId);
          if (!p) bad('Those results do not match the players in this game');
          const combo = game.combos.find((c) => c.bid?.bidGamePlayerId === p.id);
          if (!combo?.bid || combo.factionId == null || combo.playerMatId == null) {
            bad('Every player must hold a winning combo before recording');
          }
          return {
            player: p,
            factionId: combo.factionId,
            playerMatId: combo.playerMatId,
            factionName: combo.faction?.name ?? '',
            matName: combo.playerMat?.name ?? '',
            bid: combo.bid.coins,
            coins: r.coins,
            rank: idx + 1,
          };
        });

        validateMatchInput(
          input.numRounds,
          ranked.map((r) => ({
            faction: r.factionName,
            playerMat: r.matName,
            displayName: r.player.user?.username ?? `user-${r.player.userId}`,
            coins: r.coins,
            rank: r.rank,
            bid: r.bid,
          })),
        );

        // Ranked games update ratings and supersede the players' other finished
        // ranked games.
        const trueskillByPlayer = new Map<number, PlayerTrueskill>();
        if (game.ranked) {
          const userIds = game.players.flatMap((p) => (p.userId != null ? [p.userId] : []));

          const others = await tx
            .selectDistinct({ id: bidGame.id })
            .from(bidGame)
            .innerJoin(bidGamePlayer, eq(bidGamePlayer.bidGameId, bidGame.id))
            .where(
              and(
                eq(bidGame.ranked, true),
                eq(bidGame.status, 'BIDDING_FINISHED'),
                ne(bidGame.id, game.id),
                inArray(bidGamePlayer.userId, userIds),
              ),
            );
          const otherIds = others.map((o) => o.id);
          if (otherIds.length > 0) {
            await tx
              .update(bidGame)
              .set({ status: 'EXPIRED', modifiedAt: new Date() })
              .where(inArray(bidGame.id, otherIds));
          }

          const tsRows = await tx
            .select()
            .from(userTrueskill)
            .where(inArray(userTrueskill.userId, userIds));
          const tsByUser = new Map(tsRows.map((t) => [t.userId, t]));

          const changes = computeRatingUpdate(
            ranked.map((r) => {
              const ts = r.player.userId != null ? tsByUser.get(r.player.userId) : undefined;
              return {
                rating: { mu: ts?.mu ?? 25, sigma: ts?.sigma ?? 8.333333333333334 },
                finishingRank: r.rank,
              };
            }),
          );

          for (let i = 0; i < ranked.length; i++) {
            const r = ranked[i];
            const change = changes[i];
            if (!r || !change || r.player.userId == null) continue;
            trueskillByPlayer.set(r.player.id, change);
            if (tsByUser.has(r.player.userId)) {
              await tx
                .update(userTrueskill)
                .set({ mu: change.after.mu, sigma: change.after.sigma })
                .where(eq(userTrueskill.userId, r.player.userId));
            } else {
              await tx.insert(userTrueskill).values({
                userId: r.player.userId,
                mu: change.after.mu,
                sigma: change.after.sigma,
              });
            }
          }
        }

        const [createdMatch] = await tx
          .insert(matchTable)
          .values({
            numRounds: input.numRounds,
            datePlayed: new Date(input.datePlayed),
            recordingUserId: ctx.user.discordId,
          })
          .returning({ id: matchTable.id });
        if (!createdMatch) throw new Error('Failed to create match');

        for (const r of ranked) {
          const playerId = await findOrCreatePlayerForUser(
            tx,
            r.player.userId,
            r.player.user?.username ?? `user-${r.player.userId}`,
          );
          const [result] = await tx
            .insert(playerMatchResult)
            .values({
              matchId: createdMatch.id,
              playerId,
              factionId: r.factionId,
              playerMatId: r.playerMatId,
              coins: r.coins,
              rank: r.rank,
              playerTrueskill: trueskillByPlayer.get(r.player.id) ?? null,
            })
            .returning({ id: playerMatchResult.id });
          if (result) {
            await tx
              .update(bidGamePlayer)
              .set({ playerMatchResultId: result.id })
              .where(eq(bidGamePlayer.id, r.player.id));
          }
        }

        await tx
          .update(bidGame)
          .set({ status: 'GAME_RECORDED', matchId: createdMatch.id, modifiedAt: new Date() })
          .where(eq(bidGame.id, game.id));

        const entries: MatchLogEntry[] = ranked.map((r) => ({
          displayName: r.player.user?.username ?? `user-${r.player.userId}`,
          faction: r.factionName,
          playerMat: r.matName,
          coins: r.coins,
          bid: r.bid,
          rank: r.rank,
        }));
        return entries;
      });
      publishBidGameUpdated(input.bidGameId);
      if (input.shouldPostMatchLog) postMatchLog(logEntries, input.numRounds);
      return loadClientGame(ctx.db, input.bidGameId);
    }),
});

// --- helpers ---------------------------------------------------------------

function touch(tx: Tx, id: number) {
  return tx.update(bidGame).set({ modifiedAt: new Date() }).where(eq(bidGame.id, id));
}

/**
 * The `player` row for a bid-game participant (one per user); created on
 * demand. Legacy recorded bid matches through name-keyed player rows, so when
 * no row is linked to this user yet, adopt the unlinked row carrying their
 * name instead of splitting their history across a duplicate. A changed
 * Discord username propagates to the linked row and absorbs any floating
 * duplicate under the new name (legacy findOrCreatePlayer parity).
 */
async function findOrCreatePlayerForUser(
  tx: Tx,
  userId: number | null,
  displayName: string,
): Promise<number> {
  // Reassign a floating (no steamId, no linked user) same-name player's
  // results to `realId`, then drop the duplicate (legacy mergeFloatingPlayers).
  const mergeFloating = async (realId: number) => {
    const floating = await tx.query.player.findFirst({
      where: and(
        eq(playerTable.displayName, displayName),
        isNull(playerTable.userId),
        isNull(playerTable.steamId),
      ),
    });
    if (floating && floating.id !== realId) {
      await tx
        .update(playerMatchResult)
        .set({ playerId: realId })
        .where(eq(playerMatchResult.playerId, floating.id));
      await tx.delete(playerTable).where(eq(playerTable.id, floating.id));
    }
  };

  if (userId != null) {
    const existing = await tx.query.player.findFirst({ where: eq(playerTable.userId, userId) });
    if (existing) {
      if (existing.displayName !== displayName) {
        await tx.update(playerTable).set({ displayName }).where(eq(playerTable.id, existing.id));
        await mergeFloating(existing.id);
      }
      return existing.id;
    }
    // Adopt the user's name-keyed row (legacy data recorded by displayName).
    const unlinked = await tx.query.player.findFirst({
      where: and(eq(playerTable.displayName, displayName), isNull(playerTable.userId)),
    });
    if (unlinked) {
      await tx.update(playerTable).set({ userId }).where(eq(playerTable.id, unlinked.id));
      return unlinked.id;
    }
    const [created] = await tx
      .insert(playerTable)
      .values({ displayName, userId })
      .returning({ id: playerTable.id });
    if (!created) throw new Error('Failed to create player');
    return created.id;
  }
  // Userless seat (shouldn't happen for real games) — fall back to a floating player.
  const floating = await tx.query.player.findFirst({
    where: and(eq(playerTable.displayName, displayName), isNull(playerTable.userId)),
  });
  if (floating) return floating.id;
  const [created] = await tx
    .insert(playerTable)
    .values({ displayName })
    .returning({ id: playerTable.id });
  if (!created) throw new Error('Failed to create player');
  return created.id;
}

/** Host-only boolean flag toggles (quickBid / ranked), only while CREATED. */
async function updateFlag(
  db: Database,
  userId: number,
  id: number,
  set: { quickBid: boolean } | { ranked: boolean },
) {
  await runSerializable(db, async (tx) => {
    const game = await loadBidGame(tx, id);
    if (game.status !== 'CREATED') bad('That game has already started');
    requireHost(game, userId);
    await tx
      .update(bidGame)
      .set({ ...set, modifiedAt: new Date() })
      .where(eq(bidGame.id, id));
  });
  publishBidGameUpdated(id);
  return loadClientGame(db, id);
}

async function enabledCombosForPreset(tx: Tx, presetId: number): Promise<Combo[]> {
  const settings = await tx
    .select({ factionId: bidPresetSetting.factionId, playerMatId: bidPresetSetting.playerMatId })
    .from(bidPresetSetting)
    .where(and(eq(bidPresetSetting.bidPresetId, presetId), eq(bidPresetSetting.enabled, true)));
  return settings.flatMap((s) =>
    s.factionId != null && s.playerMatId != null
      ? [{ factionId: s.factionId, playerMatId: s.playerMatId }]
      : [],
  );
}

/** Verify every faction/mat id in the combos actually exists (legacy messages). */
async function assertValidCombos(tx: Tx, combos: Combo[]) {
  const factionIds = [...new Set(combos.map((c) => c.factionId))];
  const playerMatIds = [...new Set(combos.map((c) => c.playerMatId))];

  if (factionIds.length > 0) {
    const found = await tx
      .select({ id: factionTable.id })
      .from(factionTable)
      .where(inArray(factionTable.id, factionIds));
    if (found.length !== factionIds.length) bad('Invalid faction IDs');
  }
  if (playerMatIds.length > 0) {
    const found = await tx
      .select({ id: playerMatTable.id })
      .from(playerMatTable)
      .where(inArray(playerMatTable.id, playerMatIds));
    if (found.length !== playerMatIds.length) bad('Invalid player mat IDs');
  }
}
