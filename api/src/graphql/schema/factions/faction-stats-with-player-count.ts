import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import { Match, PlayerMatchResult } from '../../../db/entities';
import { redisClient } from '../../../common/services';
import { MATCH_SENSITIVE_CACHE_PREFIX } from '../../utils';
import Schema from '../codegen';

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7];

const FACTION_STAT_PREFIX = 'fs';

const getCachedVal = (
  fieldName: string,
  factionId: number,
  playerCount: number
) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}_${FACTION_STAT_PREFIX}_${fieldName}_${factionId}_${playerCount}`;
  return redisClient.get(cacheKey);
};

const setCachedVal = (
  fieldName: string,
  factionId: number,
  playerCount: number,
  val: any
) => {
  const cacheKey = `${MATCH_SENSITIVE_CACHE_PREFIX}_${FACTION_STAT_PREFIX}_${fieldName}_${factionId}_${playerCount}`;
  redisClient.set(cacheKey, JSON.stringify(val));
};

export const typeDef = gql`
  type FactionStatsWithPlayerCount {
    playerCount: Int!
    totalWins: Int!
    totalMatches: Int!
    topPlayers(first: Int!): [PlayerFactionStats!]!
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionStatsWithPlayerCount: {
    totalMatches: async ({ faction: { id }, playerCount }) => {
      try {
        const cachedVal = await getCachedVal('totalMatches', id, playerCount);

        if (cachedVal) {
          return Number.parseInt(JSON.parse(cachedVal)) || 0;
        }
      } catch (e) {
        // Pass
      }

      const pmrRepo = getRepository(PlayerMatchResult);

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
          factionId: id,
        })
        .getRawOne()) as {
        totalMatches: string;
      };

      setCachedVal(
        'totalMatches',
        id,
        playerCount,
        totalMatchesRes.totalMatches
      );

      return Number.parseInt(totalMatchesRes.totalMatches);
    },
    totalWins: async ({ faction: { id }, playerCount }) => {
      try {
        const cachedVal = await getCachedVal('totalWins', id, playerCount);

        if (cachedVal) {
          return Number.parseInt(JSON.parse(cachedVal)) || 0;
        }
      } catch (e) {
        // Pass
      }

      const pmrRepo = getRepository(PlayerMatchResult);

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
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId: id,
        })
        .getRawOne()) as {
        totalWins: string;
      };

      setCachedVal('totalMatches', id, playerCount, totalWinsRes.totalWins);

      return Number.parseInt(totalWinsRes.totalWins);
    },
    topPlayers: async ({ faction: { id }, playerCount }, { first }) => {
      try {
        const cachedVal = await getCachedVal(
          `topPlayers:${first}`,
          id,
          playerCount
        );

        if (cachedVal) {
          return JSON.parse(cachedVal);
        }
      } catch (e) {
        // Pass
      }

      const pmrRepo = getRepository(PlayerMatchResult);

      const playerWinCounts = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('player.*')
        .addSelect('COUNT(player.id)', 'winCount')
        .innerJoin('pmr.player', 'player')
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
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId: id,
        })
        .groupBy('player.id')
        .orderBy('"winCount"', 'DESC')
        .limit(first)
        .getRawMany()) as {
        id: string;
        displayName: string;
        steamId: string | null;
        winCount: string;
      }[];

      const res = playerWinCounts.map(
        ({ id, displayName, steamId, winCount }) => ({
          player: {
            id: Number.parseInt(id),
            displayName,
            steamId,
            playerMatchResults: [],
          },
          totalWins: Number.parseInt(winCount),
        })
      );

      setCachedVal(`topPlayers:${first}`, id, playerCount, res);

      return res;
    },
  },
  Faction: {
    statsByPlayerCount: (faction) => {
      return PLAYER_COUNTS.map((playerCount) => ({
        faction,
        playerCount,
      }));
    },
  },
};
