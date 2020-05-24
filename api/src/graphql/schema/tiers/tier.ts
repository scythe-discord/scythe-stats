import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import { Tier, MatComboTier } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    tiers: [Tier!]!
  }

  type Tier {
    id: Int!
    name: String!
    rank: Int!
    factionMatCombos: [FactionMatCombo!]!
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
  Tier: {
    factionMatCombos: async (tier) => {
      const matComboTierRepo = getRepository(MatComboTier);

      const matComboTiers = await matComboTierRepo.find({
        where: {
          tier,
        },
        relations: ['faction', 'playerMat'],
      });

      return matComboTiers;
    },
  },
};
