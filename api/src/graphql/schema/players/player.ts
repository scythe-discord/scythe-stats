import { gql } from 'apollo-server-express';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import { getRepository } from 'typeorm';

import { PlayerMatchResult, Player } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    player(id: ID!): Player
  }

  type Player implements Node {
    id: ID!
    displayName: String!
    steamId: String
    totalWins(factionId: Int, fromDate: String): Int!
    totalMatches(factionId: Int, fromDate: String): Int!
  }

  type PlayerConnection {
    edges: [PlayerEdge!]!
    pageInfo: PageInfo!
  }

  type PlayerEdge {
    cursor: String!
    node: Player!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    player: async (_, { id: globalId }) => {
      const { id } = fromGlobalId(globalId);
      const playerRepo = getRepository(Player);
      const player = await playerRepo.findOne(id);
      return player || null;
    },
  },
  Player: {
    id: (player) => toGlobalId('Player', player.id.toString()),
    totalWins: async (player, { factionId, fromDate }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
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
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr.coins = "maxCoins"')
        .andWhere('pmr."playerId" = :playerId', { playerId: player.id });

      if (factionId) {
        query = query.andWhere('pmr."factionId" = :factionId', {
          factionId,
        });
      }

      if (fromDate) {
        query = query.andWhere('match."datePlayed" >= :fromDate', { fromDate });
      }

      const wins = await query.getCount();
      return wins;
    },
    totalMatches: async (player, { factionId, fromDate }) => {
      const playerMatchResultRepo = getRepository(PlayerMatchResult);
      let query = playerMatchResultRepo
        .createQueryBuilder('result')
        .where('result."playerId" = :playerId', { playerId: player.id });

      if (factionId) {
        query = query.andWhere('result."factionId" = :factionId', {
          factionId,
        });
      }

      if (fromDate) {
        query = query
          .innerJoin('result.match', 'match')
          .andWhere('match."datePlayed" >= :fromDate', { fromDate });
      }

      const matches = await query.getCount();
      return matches;
    },
  },
};
