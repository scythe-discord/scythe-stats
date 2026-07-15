import {
  discordBlacklist,
  faction as factionTable,
  match as matchTable,
  playerMatchResult,
  playerMat as playerMatTable,
  player as playerTable,
} from '@scythe/db';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { z } from 'zod';
import { postMatchLog } from '../lib/discord-log';
import { RECORD_RULE } from '../lib/rate-limit';
import { runSerializable } from '../lib/txn';
import { validateMatchInput } from '../lib/validate-match';
import { publicProcedure, rateLimitedProcedure, router } from '../trpc';

// Cursor scheme kept identical to the legacy API: base64("match:<ISO date>"),
// paginating backwards through datePlayed (newest first).
function encodeCursor(datePlayed: Date): string {
  return Buffer.from(`match:${datePlayed.toISOString()}`).toString('base64');
}

function decodeCursor(cursor: string): Date {
  const raw = Buffer.from(cursor, 'base64').toString('ascii');
  const date = new Date(raw.substring('match:'.length));
  // A garbage cursor is a caller mistake — reject it rather than sending an
  // Invalid Date into the query (which would surface as a 500).
  if (Number.isNaN(date.getTime())) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid cursor' });
  }
  return date;
}

const resultInput = z.object({
  displayName: z.string().trim().min(1),
  steamId: z.string().trim().nullish(),
  faction: z.string(),
  playerMat: z.string(),
  coins: z.number().int(),
  rank: z.number().int().positive(),
});

export const matchesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        first: z.number().int().min(1).max(100),
        // Named `cursor` (not legacy `after`) so tRPC's useInfiniteQuery can
        // drive pagination; null on the first page (its initial pageParam).
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.match.findMany({
        where: input.cursor ? lt(matchTable.datePlayed, decodeCursor(input.cursor)) : undefined,
        orderBy: desc(matchTable.datePlayed),
        limit: input.first,
        with: {
          // Columns kept minimal: the full bid_game row drags in heavy jsonb
          // (bidHistory, enabledCombos) the timeline badges don't need.
          bidGame: { columns: { id: true, ranked: true } },
          results: {
            with: {
              player: true,
              faction: true,
              playerMat: true,
              // Columns restricted: quickBids holds each player's sealed bid
              // sheet, which stays server-side even after the game is recorded
              // (bids.ts strips it from every live payload for the same reason).
              // The timeline only needs the winning bid via the relation.
              bidGamePlayer: { columns: { id: true }, with: { bid: true } },
            },
          },
        },
      });

      const edges = rows.map((m) => ({
        cursor: encodeCursor(m.datePlayed),
        node: { ...m, winner: m.results.find((r) => r.rank === 1) ?? null },
      }));

      return {
        edges,
        pageInfo: {
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
          // No total count is fetched; assume another page if we filled the page.
          hasNextPage: rows.length >= input.first,
          hasPreviousPage: false,
        },
      };
    }),

  // Record a casual match. Requires login; the recorder's Discord id is stored
  // on the match. Rate-limited like the legacy @rateLimit(keyPrefix:
  // "log-match") directive; the budget is shared with bids.recordResults.
  log: rateLimitedProcedure('log-match', RECORD_RULE)
    .input(
      z.object({
        numRounds: z.number().int(),
        // ISO date string, as the legacy API accepted.
        datePlayed: z.string().datetime(),
        // Announce to the configured Discord channels (legacy default: on).
        shouldPostMatchLog: z.boolean().default(true),
        results: z.array(resultInput).min(2).max(7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recordingUserId = ctx.user.discordId;

      // Reject recorders flagged in the blacklist (legacy message preserved).
      const [flagged] = await ctx.db
        .select({ id: discordBlacklist.id })
        .from(discordBlacklist)
        .where(eq(discordBlacklist.discordId, recordingUserId));
      if (flagged) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Your account has been flagged for recording matches',
        });
      }

      // Structural validation (pure, shared with the bot/legacy parity).
      validateMatchInput(
        input.numRounds,
        input.results.map((r) => ({ ...r, bid: null })),
      );

      const datePlayed = new Date(input.datePlayed);

      // Resolve faction / mat names to ids up front (stable reference data, so
      // no need to redo it on a transaction retry). Missing names are user
      // errors, not retryable — legacy messages preserved.
      const [factions, playerMats] = await Promise.all([
        ctx.db.select().from(factionTable),
        ctx.db.select().from(playerMatTable),
      ]);
      const factionByName = new Map(factions.map((f) => [f.name, f.id]));
      const matByName = new Map(playerMats.map((m) => [m.name, m.id]));

      const resolved = input.results.map((r) => {
        const factionId = factionByName.get(r.faction);
        if (factionId === undefined) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Faction with name ${r.faction} not found`,
          });
        }
        const playerMatId = matByName.get(r.playerMat);
        if (playerMatId === undefined) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Player Mat with name ${r.playerMat} not found`,
          });
        }
        return { ...r, factionId, playerMatId };
      });

      const matchId = await runSerializable(ctx.db, async (tx) => {
        // Reassigns a "floating" (no steamId, no linked user) player's
        // results to a now-identified player, then removes the duplicate.
        // Both null checks matter: a user-linked row (userId set) is not a
        // duplicate — merging it would hand that user's history to an
        // arbitrary steam identity and delete their player link.
        const mergeFloatingPlayers = async (real: { id: number; displayName: string }) => {
          const floating = await tx.query.player.findFirst({
            where: and(
              eq(playerTable.displayName, real.displayName),
              isNull(playerTable.steamId),
              isNull(playerTable.userId),
            ),
          });
          if (floating && floating.id !== real.id) {
            await tx
              .update(playerMatchResult)
              .set({ playerId: real.id })
              .where(eq(playerMatchResult.playerId, floating.id));
            await tx.delete(playerTable).where(eq(playerTable.id, floating.id));
          }
        };

        const findOrCreatePlayer = async (displayName: string, steamId: string | null) => {
          const existing = await tx.query.player.findFirst({
            where: steamId
              ? eq(playerTable.steamId, steamId)
              : eq(playerTable.displayName, displayName),
          });
          if (existing) {
            if (existing.displayName !== displayName) {
              await tx
                .update(playerTable)
                .set({ displayName })
                .where(eq(playerTable.id, existing.id));
              await mergeFloatingPlayers({ id: existing.id, displayName });
            }
            return existing.id;
          }
          const [created] = await tx
            .insert(playerTable)
            .values({ displayName, steamId: steamId ?? null })
            .returning();
          if (!created) throw new Error('Failed to create player');
          if (steamId) await mergeFloatingPlayers({ id: created.id, displayName });
          return created.id;
        };

        const [createdMatch] = await tx
          .insert(matchTable)
          .values({ numRounds: input.numRounds, datePlayed, recordingUserId })
          .returning();
        if (!createdMatch) throw new Error('Failed to create match');

        for (const r of resolved) {
          const playerId = await findOrCreatePlayer(r.displayName, r.steamId ?? null);
          await tx.insert(playerMatchResult).values({
            matchId: createdMatch.id,
            playerId,
            factionId: r.factionId,
            playerMatId: r.playerMatId,
            coins: r.coins,
            rank: r.rank,
          });
        }

        return createdMatch.id;
      });

      if (input.shouldPostMatchLog) {
        postMatchLog(
          input.results.map((r) => ({
            displayName: r.displayName,
            faction: r.faction,
            playerMat: r.playerMat,
            coins: r.coins,
            bid: null,
            rank: r.rank,
          })),
          input.numRounds,
        );
      }

      // Return the persisted match in the same shape as `list` nodes.
      const created = await ctx.db.query.match.findFirst({
        where: eq(matchTable.id, matchId),
        with: { results: { with: { player: true, faction: true, playerMat: true } } },
      });
      if (!created) throw new Error('Logged match could not be reloaded');
      return { ...created, winner: created.results.find((r) => r.rank === 1) ?? null };
    }),
});
