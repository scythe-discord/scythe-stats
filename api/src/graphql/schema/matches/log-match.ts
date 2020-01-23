import { gql, IResolvers } from 'apollo-server';

import Schema from '../codegen';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: String!
      playerMatchResults: [PlayerMatchResultInput!]!
    ): Match
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
  }
`;

export const resolvers: IResolvers = {
  Mutation: {
    logMatch: async (
      _,
      {
        numRounds,
        datePlayed,
        playerMatchResults: loggedMatchResults
      }: Schema.MutationLogMatchArgs
    ): Promise<Schema.Mutation['logMatch']> => {
      if (numRounds === 0 || loggedMatchResults.length < 2) {
        throw new Error(
          `Failed to validate match from ${new Date(datePlayed)}`
        );
      }

      return null;
    }
  }
};
