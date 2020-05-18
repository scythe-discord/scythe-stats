import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Tier } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    tiers: [Tier!]!
  }

  type Tier {
    id: Int!
    name: String!
    rank: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    tiers: async () => {
      const tierRepo = getRepository(Tier);
      const tiers = await tierRepo.find();

      return tiers;
    },
  },
};
