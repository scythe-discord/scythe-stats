import { gql } from 'apollo-server-express';
import { toGlobalId, connectionFromArray } from 'graphql-relay';
import { getRepository } from 'typeorm';

import { Match, PlayerMatchResult } from '../../../db/entities';
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
    tieOrder: Int!
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

      const formattedMatches = matches.map((match) => ({
        id: toGlobalId('Match', match.id.toString()),
        datePlayed: match.datePlayed.toISOString(),
        playerResults: match.playerMatchResults,
        winner: match.winner,
        numRounds: match.numRounds,
      }));

      return connectionFromArray(formattedMatches, args);
    },
  },
  Match: {
    id: (match) => toGlobalId('Match', match.id.toString()),
    winner: async (match) => {
      let playerResults = match.playerResults;

      if (!playerResults) {
        const playerMatchResultRepo = getRepository(PlayerMatchResult);
        playerResults = await playerMatchResultRepo.find({
          where: {
            match: match.id,
          },
        });
      }

      const orderedResults = [...playerResults].sort((a, b) => {
        if (a.coins < b.coins) {
          return 1;
        } else if (a.coins === b.coins && a.tieOrder > b.tieOrder) {
          return 1;
        }

        return -1;
      });

      return orderedResults[0];
    },
  },
};
