import { match, player, playerMatchResult } from '@scythe/db';
import { and, asc, desc, eq, gte, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { isWin } from '../lib/stats-sql';
import { publicProcedure, router } from '../trpc';

const winFilters = z.object({
  factionId: z.number().int().positive().optional(),
  // ISO date string; only results from matches on/after this date are counted.
  fromDate: z.string().optional(),
});

// Offset cursor for the wins leaderboard: base64("players:<offset>").
function encodeOffset(offset: number): string {
  return Buffer.from(`players:${offset}`).toString('base64');
}
function decodeOffset(cursor: string): number {
  const raw = Buffer.from(cursor, 'base64').toString('ascii');
  return Number.parseInt(raw.substring('players:'.length), 10);
}

export const playersRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db.select().from(player).where(eq(player.id, input.id));
      return row ?? null;
    }),

  // Case-insensitive substring search by display name (legacy: playersByName ILIKE '%x%').
  byName: publicProcedure
    .input(
      z.object({
        startsWith: z.string().min(1),
        limit: z.number().int().min(1).max(100).default(25),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(player)
        .where(ilike(player.displayName, `%${input.startsWith}%`))
        .orderBy(asc(player.displayName))
        .limit(input.limit),
    ),

  totalWins: publicProcedure
    .input(winFilters.extend({ playerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(playerMatchResult)
        .innerJoin(match, eq(match.id, playerMatchResult.matchId))
        .where(
          and(
            eq(playerMatchResult.playerId, input.playerId),
            isWin(),
            input.factionId ? eq(playerMatchResult.factionId, input.factionId) : undefined,
            input.fromDate ? gte(match.datePlayed, new Date(input.fromDate)) : undefined,
          ),
        );
      return row?.count ?? 0;
    }),

  totalMatches: publicProcedure
    .input(winFilters.extend({ playerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(playerMatchResult)
        .innerJoin(match, eq(match.id, playerMatchResult.matchId))
        .where(
          and(
            eq(playerMatchResult.playerId, input.playerId),
            input.factionId ? eq(playerMatchResult.factionId, input.factionId) : undefined,
            input.fromDate ? gte(match.datePlayed, new Date(input.fromDate)) : undefined,
          ),
        );
      return row?.count ?? 0;
    }),

  // Leaderboard ordered by win count desc, id asc (legacy: playersByWins).
  byWins: publicProcedure
    .input(
      winFilters.extend({
        first: z.number().int().min(1).max(100),
        after: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.after ? decodeOffset(input.after) : 0;

      const rows = await ctx.db
        .select({
          id: player.id,
          displayName: player.displayName,
          steamId: player.steamId,
          userId: player.userId,
          playerWins: sql<number>`count(*)::int`,
        })
        .from(playerMatchResult)
        .innerJoin(match, eq(match.id, playerMatchResult.matchId))
        .innerJoin(player, eq(player.id, playerMatchResult.playerId))
        .where(
          and(
            isWin(),
            input.factionId ? eq(playerMatchResult.factionId, input.factionId) : undefined,
            input.fromDate ? gte(match.datePlayed, new Date(input.fromDate)) : undefined,
          ),
        )
        .groupBy(player.id)
        .orderBy(desc(sql`count(*)`), asc(player.id))
        .limit(input.first + 1)
        .offset(offset);

      const hasNextPage = rows.length > input.first;
      const page = rows.slice(0, input.first);
      const edges = page.map((node, i) => ({ cursor: encodeOffset(offset + i + 1), node }));

      return {
        edges,
        pageInfo: {
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
          hasNextPage,
          hasPreviousPage: offset > 0,
        },
      };
    }),
});
