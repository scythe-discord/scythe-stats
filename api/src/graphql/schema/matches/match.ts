import { gql } from 'graphql-tag';
import { toGlobalId, connectionFromArray } from 'graphql-relay';

import { scytheDb } from '../../../db';
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

  type Trueskill {
    sigma: Float!
    mu: Float!
  }

  type PlayerTrueskill {
    before: Trueskill!
    after: Trueskill!
  }

  type PlayerMatchResult {
    id: Int!
    player: Player!
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
    rank: Int!
    bidGamePlayer: BidGamePlayer
    playerTrueskill: PlayerTrueskill
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    matches: async (_, args) => {
      const matchRepository = scytheDb.getRepository(Match);
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
