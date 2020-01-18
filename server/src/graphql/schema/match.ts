import { gql } from 'apollo-server-express';

import { Mutation } from './types';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      playerMatchResults: [PlayerMatchResultInput!]!
    ): Match
  }

  type Match {
    id: Int!
    datePlayed: Int!
    numRounds: Int!
    playerResults: [PlayerMatchResult!]!
  }

  type PlayerMatchResult {
    displayName: String!
    steamId: String
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
  }
`;

export const resolvers = {
  Mutation: {
    logMatch: (): Mutation['logMatch'] => null
  }
};
