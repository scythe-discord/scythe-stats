import { gql } from 'graphql-tag';
import { toGlobalId } from 'graphql-relay';
import { LessThan } from 'typeorm';

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

const getMatchCursor = (m: Match) => {
  return Buffer.from(`match:${m.datePlayed.toISOString()}`).toString('base64');
};

const matchCursorToOffset = (cursor: string): Date => {
  const rawCursor = Buffer.from(cursor, 'base64').toString('ascii');

  return new Date(rawCursor.substring(6));
};

export const resolvers: Schema.Resolvers = {
  Query: {
    matches: async (_, { first, after }) => {
      const matchRepository = scytheDb.getRepository(Match);
      const matches = await matchRepository.find({
        relations: [
          'playerMatchResults',
          'playerMatchResults.player',
          'playerMatchResults.faction',
          'playerMatchResults.playerMat',
          'playerMatchResults.bidGamePlayer',
        ],
        order: {
          datePlayed: 'DESC',
        },
        where: after
          ? {
              datePlayed: LessThan(matchCursorToOffset(after)),
            }
          : undefined,
        take: first,
      });

      return {
        edges: matches.map((m) => ({
          cursor: getMatchCursor(m),
          node: m,
        })),
        pageInfo: {
          startCursor: matches[0] ? getMatchCursor(matches[0]) : undefined,
          endCursor: matches[matches.length - 1]
            ? getMatchCursor(matches[matches.length - 1])
            : undefined,
          hasNextPage: matches.length >= first,
          hasPreviousPage: false,
        },
      };
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
