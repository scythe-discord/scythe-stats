import { gql } from 'apollo-server';
import { connectionFromArray } from 'graphql-relay';
import { getRepository, Like } from 'typeorm';

import { Player } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    playersByName(
      startsWith: String!
      first: Int!
      after: String
    ): PlayerConnection!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    playersByName: async (_, { startsWith, first, after }) => {
      const playerRepository = getRepository(Player);
      const players = await playerRepository.find({
        displayName: Like(`%${startsWith}%`),
      });
      return connectionFromArray(players, { first, after });
    },
  },
};
