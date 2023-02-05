import { gql } from 'graphql-tag';
import { connectionFromArray } from 'graphql-relay';

import { scytheDb } from '../../../db';
import { Player, PlayerMatchResult } from '../../../db/entities';
import Schema from '../codegen';

interface PlayerWithWinCount extends Player {
  playerWins: string;
}

export const typeDef = gql`
  extend type Query {
    playersByWins(
      first: Int!
      after: String
      factionId: Int
      fromDate: String
    ): PlayerConnection!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    playersByWins: async (_, { first, after, factionId, fromDate }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr."playerId")', 'playerWins')
        .addSelect('player.*')
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
        .innerJoin('pmr.match', 'match')
        .innerJoin('pmr.player', 'player')
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr.coins = "maxCoins"')
        .groupBy('player.id')
        .orderBy('"playerWins"', 'DESC')
        .addOrderBy('player.id', 'ASC');

      if (factionId) {
        query = query.andWhere('pmr."factionId" = :factionId', {
          factionId,
        });
      }

      if (fromDate) {
        query = query.andWhere('match."datePlayed" >= :fromDate', { fromDate });
      }

      const playersWithWins =
        (await query.getRawMany()) as PlayerWithWinCount[];

      return connectionFromArray(playersWithWins, { first, after });
    },
  },
};
