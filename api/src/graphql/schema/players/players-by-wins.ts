import { gql } from 'apollo-server';
import { connectionFromArray } from 'graphql-relay';
import { getRepository } from 'typeorm';

import { Match, Player } from '../../../db/entities';
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
      const matchRepository = getRepository(Match);
      let query = matchRepository
        .createQueryBuilder('match')
        .innerJoin('match.winner', 'winner')
        .innerJoin('winner.player', 'player')
        .groupBy('player.id')
        .select('COUNT(player.id)', 'playerWins')
        .addSelect('player.*');

      if (factionId) {
        query = query.andWhere('winner."factionId" = :factionId', {
          factionId
        });
      }

      if (fromDate) {
        query = query.andWhere('match."datePlayed" >= :fromDate', { fromDate });
      }

      const playersWithWins = (await query.getRawMany()) as PlayerWithWinCount[];

      playersWithWins.sort((a, b) => {
        const playerWinsA = parseInt(a.playerWins);
        const playerWinsB = parseInt(b.playerWins);
        if (playerWinsA === playerWinsB) {
          return b.id - a.id;
        }

        return playerWinsB - playerWinsA;
      });

      return connectionFromArray(playersWithWins, { first, after });
    }
  }
};
