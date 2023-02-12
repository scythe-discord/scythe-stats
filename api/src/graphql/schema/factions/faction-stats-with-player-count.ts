import { gql } from 'graphql-tag';

import { scytheDb } from '../../../db';
import { Match, PlayerMatchResult } from '../../../db/entities';
import Schema from '../codegen';

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7];

export const typeDef = gql`
  type FactionStatsWithPlayerCount {
    playerCount: Int!
    totalWins: Int!
    totalMatches: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionStatsWithPlayerCount: {
    totalMatches: async ({ faction: { id }, playerCount }) => {
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
          factionId: id,
        })
        .getRawOne()) as {
        totalMatches: string;
      };

      return Number.parseInt(totalMatchesRes.totalMatches) || 0;
    },
    totalWins: async ({ faction: { id }, playerCount }) => {
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
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId: id,
        })
        .getRawOne()) as {
        totalWins: string;
      };

      return Number.parseInt(totalWinsRes.totalWins) || 0;
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
