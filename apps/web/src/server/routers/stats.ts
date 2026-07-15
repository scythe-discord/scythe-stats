import { faction, matComboTier, match, player, playerMatchResult, tier } from '@scythe/db';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { isWin, playerCountPerMatch } from '../lib/stats-sql';
import { publicProcedure, router } from '../trpc';

// Optional filter: count only matches whose total player count is in this set
// (legacy `playerCounts: [Int!]`). 2–7 are the only valid Scythe table sizes.
const playerCountsFilter = z.object({
  playerCounts: z.array(z.number().int().min(2).max(7)).nonempty().optional(),
});

export const statsRouter = router({
  // Per-faction win/match totals (legacy Faction.totalWins / totalMatches).
  factionStats: publicProcedure.input(playerCountsFilter).query(async ({ ctx, input }) => {
    const { db } = ctx;
    const counts = input.playerCounts;
    const pcTotals = playerCountPerMatch(db);
    const pcWins = playerCountPerMatch(db);

    let totalsQuery = db
      .select({ factionId: playerMatchResult.factionId, totalMatches: sql<number>`count(*)::int` })
      .from(playerMatchResult)
      .$dynamic();
    let winsQuery = db
      .select({ factionId: playerMatchResult.factionId, totalWins: sql<number>`count(*)::int` })
      .from(playerMatchResult)
      .$dynamic();

    if (counts) {
      totalsQuery = totalsQuery.innerJoin(
        pcTotals,
        eq(pcTotals.matchId, playerMatchResult.matchId),
      );
      winsQuery = winsQuery.innerJoin(pcWins, eq(pcWins.matchId, playerMatchResult.matchId));
    }

    const [totals, wins, factions] = await Promise.all([
      totalsQuery
        .where(counts ? inArray(pcTotals.playerCount, counts) : undefined)
        .groupBy(playerMatchResult.factionId),
      winsQuery
        .where(and(isWin(), counts ? inArray(pcWins.playerCount, counts) : undefined))
        .groupBy(playerMatchResult.factionId),
      db.select().from(faction).orderBy(asc(faction.position)),
    ]);

    const totalsMap = new Map(totals.map((r) => [r.factionId, r.totalMatches]));
    const winsMap = new Map(wins.map((r) => [r.factionId, r.totalWins]));

    return factions.map((f) => ({
      factionId: f.id,
      name: f.name,
      totalMatches: totalsMap.get(f.id) ?? 0,
      totalWins: winsMap.get(f.id) ?? 0,
    }));
  }),

  // factionStats broken out by table size, one row per (faction, playerCount)
  // cell with at least one match — a single query pair for the by-count
  // win-rate chart (the client previously fanned out one filtered factionStats
  // call per count).
  factionStatsByPlayerCount: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const pcTotals = playerCountPerMatch(db);
    const pcWins = playerCountPerMatch(db);

    const [totals, wins] = await Promise.all([
      db
        .select({
          factionId: playerMatchResult.factionId,
          playerCount: pcTotals.playerCount,
          totalMatches: sql<number>`count(*)::int`,
        })
        .from(playerMatchResult)
        .innerJoin(pcTotals, eq(pcTotals.matchId, playerMatchResult.matchId))
        .groupBy(playerMatchResult.factionId, pcTotals.playerCount),
      db
        .select({
          factionId: playerMatchResult.factionId,
          playerCount: pcWins.playerCount,
          totalWins: sql<number>`count(*)::int`,
        })
        .from(playerMatchResult)
        .innerJoin(pcWins, eq(pcWins.matchId, playerMatchResult.matchId))
        .where(isWin())
        .groupBy(playerMatchResult.factionId, pcWins.playerCount),
    ]);

    const winsMap = new Map(wins.map((w) => [`${w.factionId}:${w.playerCount}`, w.totalWins]));
    return totals.map((t) => ({
      factionId: t.factionId,
      playerCount: t.playerCount,
      totalMatches: t.totalMatches,
      totalWins: winsMap.get(`${t.factionId}:${t.playerCount}`) ?? 0,
    }));
  }),

  // Per (faction, mat) combo aggregates: totals + win stats
  // (legacy FactionMatCombo fields, backed by FactionMatStatsDataSource).
  comboStats: publicProcedure.input(playerCountsFilter).query(async ({ ctx, input }) => {
    const { db } = ctx;
    const counts = input.playerCounts;
    const pcTotals = playerCountPerMatch(db);
    const pcWins = playerCountPerMatch(db);

    let totalsQuery = db
      .select({
        factionId: playerMatchResult.factionId,
        playerMatId: playerMatchResult.playerMatId,
        totalMatches: sql<number>`count(*)::int`,
      })
      .from(playerMatchResult)
      .$dynamic();
    let winsQuery = db
      .select({
        factionId: playerMatchResult.factionId,
        playerMatId: playerMatchResult.playerMatId,
        totalWins: sql<number>`count(*)::int`,
        avgCoins: sql<number>`avg(${playerMatchResult.coins})`,
        avgRounds: sql<number>`avg(${match.numRounds})`,
        minRounds: sql<number>`min(${match.numRounds})::int`,
      })
      .from(playerMatchResult)
      .innerJoin(match, eq(match.id, playerMatchResult.matchId))
      .$dynamic();

    if (counts) {
      totalsQuery = totalsQuery.innerJoin(
        pcTotals,
        eq(pcTotals.matchId, playerMatchResult.matchId),
      );
      winsQuery = winsQuery.innerJoin(pcWins, eq(pcWins.matchId, playerMatchResult.matchId));
    }

    const groupCols = [playerMatchResult.factionId, playerMatchResult.playerMatId] as const;
    const [totals, wins] = await Promise.all([
      totalsQuery
        .where(counts ? inArray(pcTotals.playerCount, counts) : undefined)
        .groupBy(...groupCols),
      winsQuery
        .where(and(isWin(), counts ? inArray(pcWins.playerCount, counts) : undefined))
        .groupBy(...groupCols),
    ]);

    const key = (factionId: number | null, playerMatId: number | null) =>
      `${factionId}:${playerMatId}`;
    const winsMap = new Map(wins.map((w) => [key(w.factionId, w.playerMatId), w]));

    return totals.map((t) => {
      const w = winsMap.get(key(t.factionId, t.playerMatId));
      return {
        factionId: t.factionId,
        playerMatId: t.playerMatId,
        totalMatches: t.totalMatches,
        totalWins: w?.totalWins ?? 0,
        // Legacy floored avg coins to an int; rounds kept as a float.
        avgCoinsOnWin: w ? Math.floor(Number(w.avgCoins)) : 0,
        avgRoundsOnWin: w ? Number(w.avgRounds) : 0,
        leastRoundsForWin: w ? w.minRounds : null,
      };
    });
  }),

  // The tier list: each tier with its (faction, mat) combos (legacy Tier.factionMatCombos).
  tierList: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        tierId: tier.id,
        name: tier.name,
        rank: tier.rank,
        factionId: matComboTier.factionId,
        playerMatId: matComboTier.playerMatId,
      })
      .from(tier)
      .leftJoin(matComboTier, eq(matComboTier.tierId, tier.id))
      .orderBy(asc(tier.rank));

    type TierEntry = {
      tierId: number;
      name: string;
      rank: number;
      combos: { factionId: number; playerMatId: number }[];
    };
    const tiers = new Map<number, TierEntry>();
    for (const r of rows) {
      let entry = tiers.get(r.tierId);
      if (!entry) {
        entry = { tierId: r.tierId, name: r.name, rank: r.rank, combos: [] };
        tiers.set(r.tierId, entry);
      }
      if (r.factionId != null && r.playerMatId != null) {
        entry.combos.push({ factionId: r.factionId, playerMatId: r.playerMatId });
      }
    }
    return [...tiers.values()];
  }),

  // Top players by wins for a faction, optionally narrowed to one mat combo and/or
  // player counts (legacy Faction.topPlayers + FactionMatCombo.topPlayers).
  topPlayers: publicProcedure
    .input(
      playerCountsFilter.extend({
        factionId: z.number().int().positive(),
        playerMatId: z.number().int().positive().optional(),
        first: z.number().int().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const pc = playerCountPerMatch(db);

      const conditions = [isWin(), eq(playerMatchResult.factionId, input.factionId)];
      if (input.playerMatId) conditions.push(eq(playerMatchResult.playerMatId, input.playerMatId));

      let query = db
        .select({
          id: player.id,
          displayName: player.displayName,
          steamId: player.steamId,
          userId: player.userId,
          totalWins: sql<number>`count(*)::int`,
        })
        .from(playerMatchResult)
        .innerJoin(player, eq(player.id, playerMatchResult.playerId))
        .$dynamic();

      if (input.playerCounts) {
        query = query.innerJoin(pc, eq(pc.matchId, playerMatchResult.matchId));
        conditions.push(inArray(pc.playerCount, input.playerCounts));
      }

      const rows = await query
        .where(and(...conditions))
        .groupBy(player.id)
        .orderBy(desc(sql`count(*)`), asc(player.id))
        .limit(input.first);

      return rows.map(({ totalWins, ...node }) => ({ player: node, totalWins }));
    }),
});
