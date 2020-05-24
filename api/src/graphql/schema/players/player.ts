import { gql } from 'apollo-server-express';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import { getRepository } from 'typeorm';

import { Match, PlayerMatchResult, Player } from '../../../db/entities';
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
      const matchRepo = getRepository(Match);
      let query = matchRepo
        .createQueryBuilder('match')
        .innerJoin('match.winner', 'winner')
        .where('winner."playerId" = :playerId', { playerId: player.id });

      if (factionId) {
        query = query.andWhere('winner."factionId" = :factionId', {
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
