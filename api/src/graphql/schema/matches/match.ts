import { gql } from 'apollo-server';
import { toGlobalId, connectionFromArray } from 'graphql-relay';
import { getRepository, getManager, EntityManager } from 'typeorm';

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
    playerResults: [PlayerMatchResult!]!
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
    player: Player!
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
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
          'playerMatchResults.playerMat'
        ],
        order: {
          datePlayed: 'ASC'
        }
      });

      const formattedMatches = matches.map(match => ({
        id: toGlobalId('Match', match.id.toString()),
        datePlayed: match.datePlayed.toISOString(),
        playerResults: match.playerMatchResults,
        numRounds: match.numRounds
      }));

      return connectionFromArray(formattedMatches, args);
    }
  },
  Match: {
    id: match => toGlobalId('Match', match.id.toString())
  }
};
