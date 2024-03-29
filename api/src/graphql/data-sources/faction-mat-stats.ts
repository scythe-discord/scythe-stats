import { Match, PlayerMatchResult } from '../../db/entities';
import { scytheDb } from '../../db';
import { redisClient } from '../../common/services';
import { MATCH_SENSITIVE_CACHE_PREFIX } from '../utils';
import DataLoader from 'dataloader';

export type ComboTotalStats = {
  totalMatches: number;
};
export type ComboWinStats = {
  totalWins: number;
  avgCoins: number;
  avgRounds: number;
  minRounds: number;
};
export type TotalStats = Map<number, Map<number, ComboTotalStats>>;
export type WinStats = Map<number, Map<number, ComboWinStats>>;
export type TotalStatsByPlayerCount = Map<
  number,
  Map<number, Map<number, ComboTotalStats>>
>;
export type WinStatsByPlayerCount = Map<
  number,
  Map<number, Map<number, ComboWinStats>>
>;
export type BatchStatsInput = {
  factionId: number;
  playerMatId: number;
};

const getCachedVal = (fieldName: string) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}:${fieldName}`;
  return redisClient.get(cacheKey);
};

const setCachedVal = (fieldName: string, val: any) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}:${fieldName}`;
  redisClient.set(cacheKey, JSON.stringify(val), 'EX', 3600);
};

const totalStatsCacheKey = 'totalStats';
const winStatsCacheKey = 'winStats';
const totalStatsByPlayerCountCacheKey = 'totalStatsByPlayerCount';
const winStatsByPlayerCountCacheKey = 'winStatsByPlayerCount';

export class FactionMatStatsDataSource {
  private async getTotalStatsInternal(): Promise<TotalStats> {
    let totalMatchStatsRes: {
      totalMatches: string;
      factionId: number;
      playerMatId: number;
    }[];
    try {
      const cachedVal = await getCachedVal(totalStatsCacheKey);

      if (cachedVal) {
        totalMatchStatsRes = JSON.parse(cachedVal);
      } else {
        throw new Error('Cache miss');
      }
    } catch (e) {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      totalMatchStatsRes = await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalMatches')
        .addSelect('pmr.factionId', 'factionId')
        .addSelect('pmr.playerMatId', 'playerMatId')
        .addGroupBy('pmr."factionId"')
        .addGroupBy('pmr."playerMatId"')
        .getRawMany();

      setCachedVal(totalStatsCacheKey, totalMatchStatsRes);
    }

    const totalStats = new Map<number, Map<number, ComboTotalStats>>();

    totalMatchStatsRes.forEach(({ totalMatches, factionId, playerMatId }) => {
      if (!totalStats.has(factionId)) {
        totalStats.set(factionId, new Map());
      }

      const factionTotalStats = totalStats.get(factionId);

      factionTotalStats?.set(playerMatId, {
        totalMatches: parseInt(totalMatches),
      });
    });

    return totalStats;
  }

  private async getWinStatsInternal(): Promise<WinStats> {
    let winStatsRes: {
      totalWinsRaw: string;
      avgCoinsRaw: string;
      avgRoundsRaw: string;
      minRounds: number;
      factionId: number;
      playerMatId: number;
    }[];
    try {
      const cachedVal = await getCachedVal(winStatsCacheKey);

      if (cachedVal) {
        winStatsRes = JSON.parse(cachedVal);
      } else {
        throw new Error('Cache miss');
      }
    } catch (e) {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      winStatsRes = await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalWinsRaw')
        .addSelect('pmr.factionId', 'factionId')
        .addSelect('pmr.playerMatId', 'playerMatId')
        .addSelect('AVG(pmr.coins)', 'avgCoinsRaw')
        .addSelect('AVG("playerCounts"."numRounds")', 'avgRoundsRaw')
        .addSelect('MIN("playerCounts"."numRounds")', 'minRounds')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'pmr2')
              .select('MAX(pmr2.coins)', 'maxCoins')
              .addSelect('pmr2."matchId"')
              .groupBy('pmr2."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('match.id', 'matchId')
              .addSelect('match.numRounds', 'numRounds'),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .groupBy('pmr."factionId"')
        .addGroupBy('pmr."playerMatId"')
        .getRawMany();

      setCachedVal(winStatsCacheKey, winStatsRes);
    }

    const winStats = new Map<number, Map<number, ComboWinStats>>();

    winStatsRes.forEach(
      ({
        totalWinsRaw,
        avgCoinsRaw,
        avgRoundsRaw,
        minRounds,
        factionId,
        playerMatId,
      }) => {
        const totalWins = parseInt(totalWinsRaw);
        const avgCoins = Math.floor(parseFloat(avgCoinsRaw));
        const avgRounds = parseFloat(avgRoundsRaw);

        if (!winStats.has(factionId)) {
          winStats.set(factionId, new Map());
        }

        const factionTotalStats = winStats.get(factionId);

        factionTotalStats?.set(playerMatId, {
          totalWins,
          avgCoins,
          avgRounds,
          minRounds,
        });
      }
    );

    return winStats;
  }

  private async getTotalStatsByPlayerCountInternal(): Promise<TotalStatsByPlayerCount> {
    let totalMatchStatsRes: {
      totalMatches: string;
      playerCount: string;
      factionId: number;
      playerMatId: number;
    }[];
    try {
      const cachedVal = await getCachedVal(totalStatsByPlayerCountCacheKey);

      if (cachedVal) {
        totalMatchStatsRes = JSON.parse(cachedVal);
      } else {
        throw new Error('Cache miss');
      }
    } catch (e) {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      totalMatchStatsRes = await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalMatches')
        .addSelect('pmr.factionId', 'factionId')
        .addSelect('pmr.playerMatId', 'playerMatId')
        .addSelect('"playerCounts"."playerCount"', 'playerCount')
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id'),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .groupBy('"playerCounts"."playerCount"')
        .addGroupBy('pmr."factionId"')
        .addGroupBy('pmr."playerMatId"')
        .getRawMany();

      setCachedVal(totalStatsByPlayerCountCacheKey, totalMatchStatsRes);
    }

    const totalStats = new Map<
      number,
      Map<number, Map<number, ComboTotalStats>>
    >();

    totalMatchStatsRes.forEach(
      ({ playerCount, totalMatches, factionId, playerMatId }) => {
        if (!totalStats.has(factionId)) {
          totalStats.set(factionId, new Map());
        }

        const factionTotalStats = totalStats.get(factionId);

        if (!factionTotalStats?.get(playerMatId)) {
          factionTotalStats?.set(playerMatId, new Map());
        }

        const comboTotalStats = factionTotalStats?.get(playerMatId);

        comboTotalStats?.set(parseInt(playerCount), {
          totalMatches: parseInt(totalMatches),
        });
      }
    );

    return totalStats;
  }

  private async getWinStatsByPlayerCountInternal(): Promise<WinStatsByPlayerCount> {
    let winStatsRes: {
      totalWinsRaw: string;
      avgCoinsRaw: string;
      avgRoundsRaw: string;
      playerCountRaw: string;
      minRounds: number;
      factionId: number;
      playerMatId: number;
    }[];
    try {
      const cachedVal = await getCachedVal(winStatsByPlayerCountCacheKey);

      if (cachedVal) {
        winStatsRes = JSON.parse(cachedVal);
      } else {
        throw new Error('Cache miss');
      }
    } catch (e) {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      winStatsRes = await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalWinsRaw')
        .addSelect('pmr.factionId', 'factionId')
        .addSelect('pmr.playerMatId', 'playerMatId')
        .addSelect('AVG(pmr.coins)', 'avgCoinsRaw')
        .addSelect('AVG("playerCounts"."numRounds")', 'avgRoundsRaw')
        .addSelect('MIN("playerCounts"."numRounds")', 'minRounds')
        .addSelect('"playerCounts"."playerCount"', 'playerCountRaw')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'pmr2')
              .select('MAX(pmr2.coins)', 'maxCoins')
              .addSelect('pmr2."matchId"')
              .groupBy('pmr2."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .addSelect('match.numRounds', 'numRounds')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id'),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .groupBy('"playerCounts"."playerCount"')
        .addGroupBy('pmr."factionId"')
        .addGroupBy('pmr."playerMatId"')
        .getRawMany();

      setCachedVal(winStatsByPlayerCountCacheKey, winStatsRes);
    }

    const winStats = new Map<number, Map<number, Map<number, ComboWinStats>>>();

    winStatsRes.forEach(
      ({
        playerCountRaw,
        totalWinsRaw,
        avgCoinsRaw,
        avgRoundsRaw,
        minRounds,
        factionId,
        playerMatId,
      }) => {
        const playerCount = parseInt(playerCountRaw);
        const totalWins = parseInt(totalWinsRaw);
        const avgCoins = Math.floor(parseFloat(avgCoinsRaw));
        const avgRounds = parseFloat(avgRoundsRaw);

        if (!winStats.has(factionId)) {
          winStats.set(factionId, new Map());
        }

        const factionTotalStats = winStats.get(factionId);

        if (!factionTotalStats?.get(playerMatId)) {
          factionTotalStats?.set(playerMatId, new Map());
        }

        const comboTotalStats = factionTotalStats?.get(playerMatId);

        comboTotalStats?.set(playerCount, {
          totalWins,
          avgCoins,
          avgRounds,
          minRounds,
        });
      }
    );

    return winStats;
  }

  private batchTotalStats = new DataLoader<
    BatchStatsInput,
    ComboTotalStats | null
  >(async (inputs) => {
    const totalStats = await this.getTotalStatsInternal();

    return inputs.map(({ factionId, playerMatId }) => {
      const res = totalStats.get(factionId)?.get(playerMatId);

      if (!res) {
        return null;
      }

      return res;
    });
  });

  private batchWinStats = new DataLoader<BatchStatsInput, ComboWinStats | null>(
    async (inputs) => {
      const totalStats = await this.getWinStatsInternal();

      return inputs.map(({ factionId, playerMatId }) => {
        const res = totalStats.get(factionId)?.get(playerMatId);

        if (!res) {
          return null;
        }

        return res;
      });
    }
  );

  private batchTotalStatsByPlayerCount = new DataLoader<
    BatchStatsInput,
    Map<number, ComboTotalStats> | null
  >(async (inputs) => {
    const totalStats = await this.getTotalStatsByPlayerCountInternal();

    return inputs.map(({ factionId, playerMatId }) => {
      const res = totalStats.get(factionId)?.get(playerMatId);

      if (!res) {
        return null;
      }

      return res;
    });
  });

  private batchWinStatsByPlayerCount = new DataLoader<
    BatchStatsInput,
    Map<number, ComboWinStats> | null
  >(async (inputs) => {
    const totalStats = await this.getWinStatsByPlayerCountInternal();

    return inputs.map(({ factionId, playerMatId }) => {
      const res = totalStats.get(factionId)?.get(playerMatId);

      if (!res) {
        return null;
      }

      return res;
    });
  });

  async getTotalStatsByPlayerCount(
    factionId: number,
    playerMatId: number
  ): Promise<Map<number, ComboTotalStats> | null> {
    return this.batchTotalStatsByPlayerCount.load({
      factionId,
      playerMatId,
    });
  }

  async getWinStatsByPlayerCount(
    factionId: number,
    playerMatId: number
  ): Promise<Map<number, ComboWinStats> | null> {
    return this.batchWinStatsByPlayerCount.load({
      factionId,
      playerMatId,
    });
  }

  async getTotalStats(
    factionId: number,
    playerMatId: number
  ): Promise<ComboTotalStats | null> {
    return this.batchTotalStats.load({
      factionId,
      playerMatId,
    });
  }

  async getWinStats(
    factionId: number,
    playerMatId: number
  ): Promise<ComboWinStats | null> {
    return this.batchWinStats.load({
      factionId,
      playerMatId,
    });
  }
}
