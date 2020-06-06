import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import { Match, PlayerMatchResult } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  type FactionStatsWithPlayerCount {
    playerCount: Int!
    totalWins: Int!
    totalMatches: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Faction: {
    statsByPlayerCount: async ({ id }) => {
      const pmrRepo = getRepository(PlayerMatchResult);

      const totalMatchesByPlayerCount = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT("playerCounts"."playerCount")', 'totalMatches')
        .addSelect('"playerCounts"."playerCount"', 'playerCount')
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('COUNT(pmr.id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'pmr')
              .groupBy('match.id'),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."factionId" = :factionId', {
          factionId: id,
        })
        .groupBy('"playerCounts"."playerCount"')
        .getRawMany()) as {
        totalMatches: string;
        playerCount: string;
      }[];

      const totalWinsByPlayerCount = (await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT("playerCounts"."playerCount")', 'totalWins')
        .addSelect('"playerCounts"."playerCount"', 'playerCount')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'temp')
              .select('MAX(temp.coins)', 'maxCoins')
              .addSelect('temp."matchId"')
              .groupBy('temp."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .innerJoin(
          (qb) =>
            qb
              .from(Match, 'match')
              .select('COUNT(pmr.id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'pmr')
              .groupBy('match.id'),
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId: id,
        })
        .groupBy('"playerCounts"."playerCount"')
        .getRawMany()) as {
        totalWins: string;
        playerCount: string;
      }[];

      return totalMatchesByPlayerCount
        .map((totalMatchInfo) => {
          const totalWinInfo = totalWinsByPlayerCount.find(
            ({ playerCount }) => playerCount === totalMatchInfo.playerCount
          );

          return {
            playerCount: Number.parseInt(totalMatchInfo.playerCount),
            totalMatches: Number.parseInt(totalMatchInfo.totalMatches),
            totalWins: totalWinInfo
              ? Number.parseInt(totalWinInfo.totalWins)
              : 0,
          };
        })
        .sort((a, b) => (a.playerCount < b.playerCount ? -1 : 1));
    },
  },
};
