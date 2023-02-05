import { gql } from 'graphql-tag';
import { Equal } from 'typeorm';

import { scytheDb } from '../../../db';
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
      const tierRepo = scytheDb.getRepository(Tier);
      const tiers = await tierRepo.find();

      return tiers;
    },
  },
  Tier: {
    factionMatCombos: async (tier) => {
      const matComboTierRepo = scytheDb.getRepository(MatComboTier);

      const matComboTiers = await matComboTierRepo.find({
        where: {
          tier: Equal(tier.id),
        },
        relations: ['faction', 'playerMat'],
      });

      return matComboTiers;
    },
  },
};
