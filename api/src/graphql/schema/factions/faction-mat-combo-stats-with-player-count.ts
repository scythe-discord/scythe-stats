import { gql } from 'graphql-tag';

import { Match, PlayerMatchResult } from '../../../db/entities';
import { scytheDb } from '../../../db';
import { redisClient } from '../../../common/services';
import { MATCH_SENSITIVE_CACHE_PREFIX } from '../../utils';
import Schema from '../codegen';

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7];

const COMBO_PREFIX = 'fmc';

const getCachedVal = (
  fieldName: string,
  factionId: number,
  playerMatId: number,
  playerCount: number
) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}:${COMBO_PREFIX}:${fieldName}:${factionId}:${playerMatId}:${playerCount}`;
  return redisClient.get(cacheKey);
};

const setCachedVal = (
  fieldName: string,
  factionId: number,
  playerMatId: number,
  playerCount: number,
  val: any
) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}:${COMBO_PREFIX}:${fieldName}:${factionId}:${playerMatId}:${playerCount}`;
  redisClient.set(cacheKey, JSON.stringify(val));
};

export const typeDef = gql`
  type FactionMatComboStatsWithPlayerCount {
    playerCount: Int!
    totalWins: Int!
    totalMatches: Int!
    avgCoinsOnWin: Float!
    avgRoundsOnWin: Float!
    leastRoundsForWin: Int
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionMatComboStatsWithPlayerCount: {
    totalMatches: async ({ faction, playerMat, playerCount }) => {
      try {
        const cachedVal = await getCachedVal(
          'totalMatches',
          faction.id,
          playerMat.id,
          playerCount
        );

        if (cachedVal) {
          return Number.parseInt(JSON.parse(cachedVal)) || 0;
        }
      } catch (e) {
        // Pass
      }

      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);

      const totalMatchesRes = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalMatches')
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id')
              .having('COUNT("matchPlayers".id) = :playerCount', {
                playerCount,
              }),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne()) as {
        totalMatches: string;
      };

      setCachedVal(
        'totalMatches',
        faction.id,
        playerMat.id,
        playerCount,
        totalMatchesRes.totalMatches
      );
      return Number.parseInt(totalMatchesRes.totalMatches) || 0;
    },
    totalWins: async ({ faction, playerMat, playerCount }) => {
      try {
        const cachedVal = await getCachedVal(
          'totalWins',
          faction.id,
          playerMat.id,
          playerCount
        );

        if (cachedVal) {
          return Number.parseInt(JSON.parse(cachedVal)) || 0;
        }
      } catch {
        // Pass
      }

      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);

      const totalWinsRes = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalWins')
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
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id')
              .having('COUNT("matchPlayers".id) = :playerCount', {
                playerCount,
              }),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', { factionId: faction.id })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne()) as {
        totalWins: string;
      };

      setCachedVal(
        'totalWins',
        faction.id,
        playerMat.id,
        playerCount,
        totalWinsRes.totalWins
      );
      return Number.parseInt(totalWinsRes.totalWins) || 0;
    },
    avgCoinsOnWin: async ({ faction, playerMat, playerCount }) => {
      try {
        const cachedVal = await getCachedVal(
          'avgCoinsOnWin',
          faction.id,
          playerMat.id,
          playerCount
        );

        if (cachedVal) {
          return Number.parseFloat(JSON.parse(cachedVal)) || 0;
        }
      } catch {
        // Pass
      }

      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);

      const totalWinsRes = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(pmr.coins)', 'avgCoins')
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
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id')
              .having('COUNT("matchPlayers".id) = :playerCount', {
                playerCount,
              }),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', { factionId: faction.id })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne()) as {
        avgCoins: string;
      };

      setCachedVal(
        'avgCoinsOnWin',
        faction.id,
        playerMat.id,
        playerCount,
        totalWinsRes.avgCoins
      );

      return Number.parseFloat(totalWinsRes.avgCoins) || 0;
    },
    avgRoundsOnWin: async ({ faction, playerMat, playerCount }) => {
      try {
        const cachedVal = await getCachedVal(
          'avgRoundsOnWin',
          faction.id,
          playerMat.id,
          playerCount
        );

        if (cachedVal) {
          return Number.parseFloat(JSON.parse(cachedVal)) || 0;
        }
      } catch {
        // Pass
      }

      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);

      const totalWinsRes = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(match.numRounds)', 'avgRounds')
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
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id')
              .having('COUNT("matchPlayers".id) = :playerCount', {
                playerCount,
              }),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .innerJoin('pmr.match', 'match')
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', { factionId: faction.id })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne()) as {
        avgRounds: string;
      };

      setCachedVal(
        'avgRoundsOnWin',
        faction.id,
        playerMat.id,
        playerCount,
        totalWinsRes.avgRounds
      );

      return Number.parseFloat(totalWinsRes.avgRounds) || 0;
    },
    leastRoundsForWin: async ({ faction, playerMat, playerCount }) => {
      try {
        const cachedVal = await getCachedVal(
          'leastRoundsForWin',
          faction.id,
          playerMat.id,
          playerCount
        );

        if (cachedVal) {
          return Number.parseInt(JSON.parse(cachedVal)) || null;
        }
      } catch {
        // Pass
      }

      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);

      const totalWinsRes = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('MIN(match.numRounds)', 'minRounds')
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
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id')
              .having('COUNT("matchPlayers".id) = :playerCount', {
                playerCount,
              }),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .innerJoin('pmr.match', 'match')
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', { factionId: faction.id })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne()) as {
        minRounds: string;
      };

      setCachedVal(
        'leastRoundsForWin',
        faction.id,
        playerMat.id,
        playerCount,
        totalWinsRes.minRounds
      );

      return Number.parseInt(totalWinsRes.minRounds) || null;
    },
  },
  FactionMatCombo: {
    statsByPlayerCount: ({ faction, playerMat }) => {
      return PLAYER_COUNTS.map((playerCount) => ({
        faction,
        playerMat,
        playerCount,
      }));
    },
  },
};
