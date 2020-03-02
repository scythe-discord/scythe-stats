import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Match } from '../../../db/entities';
import Schema from '../codegen';

interface WinningFactionWithPlayerCount {
  playerCount: string;
  winnerFactionId: number;
}

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
      const stats: {
        [key: string]: { totalWins: number; totalMatches: number };
      } = {};
      const matchRepo = getRepository(Match);

      const builder = matchRepo.createQueryBuilder('match');

      const relevantMatches = (await builder
        .where(
          qb =>
            `match.id IN ${qb
              .subQuery()
              .select('match.id')
              .from(Match, 'match')
              .innerJoin('match.playerMatchResults', 'results')
              .where('results."factionId" = :factionId', { factionId: id })
              .getQuery()}`
        )
        .innerJoin('match.playerMatchResults', 'results')
        .innerJoin('match.winner', 'winner')
        .groupBy('match.id')
        .addGroupBy('winner."factionId"')
        .select('COUNT(results.id)', 'playerCount')
        .addSelect('winner."factionId"', 'winnerFactionId')
        .getRawMany()) as WinningFactionWithPlayerCount[];

      relevantMatches.forEach(({ playerCount, winnerFactionId }) => {
        if (!stats[playerCount]) {
          stats[playerCount] = {
            totalWins: 0,
            totalMatches: 0
          };
        }

        if (winnerFactionId === id) {
          stats[playerCount].totalWins++;
        }

        stats[playerCount].totalMatches++;
      });

      return Object.keys(stats).map(key => ({
        ...stats[key],
        playerCount: parseInt(key)
      }));
    }
  }
};
