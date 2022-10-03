import { gql } from 'apollo-server-express';
import { toGlobalId, connectionFromArray } from 'graphql-relay';
import { getRepository } from 'typeorm';

import { Match } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    matches(first: Int!, after: String): MatchConnection!
  }

  type Match implements Node {
    id: ID!
    datePlayed: String!
    numRounds: Int!
    playerMatchResults: [PlayerMatchResult!]!
    winner: PlayerMatchResult!
  }

  type MatchConnection {
    edges: [MatchEdge!]!
    pageInfo: PageInfo!
  }

  type MatchEdge {
    cursor: String!
    node: Match!
  }

  type PlayerMatchResult {
    id: Int!
    player: Player!
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
    rank: Int!
    bidGamePlayer: BidGamePlayer
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    matches: async (_, args) => {
      const matchRepository = getRepository(Match);
      const matches = await matchRepository.find({
        relations: [
          'playerMatchResults',
          'playerMatchResults.player',
          'playerMatchResults.faction',
          'playerMatchResults.playerMat',
        ],
        order: {
          datePlayed: 'DESC',
        },
      });

      return connectionFromArray(matches, args);
    },
  },
  Match: {
    id: (match) => toGlobalId('Match', match.id.toString()),
    datePlayed: (match) => match.datePlayed.toISOString(),
    winner: async (match) => {
      const foundResults = match.playerMatchResults.find(
        ({ rank }) => rank === 1
      );

      if (!foundResults) {
        throw new Error('No winner found');
      }

      return foundResults;
    },
  },
};
