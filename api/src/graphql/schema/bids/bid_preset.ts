import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';
import { BidPreset } from '../../../db/entities';

import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    bidPresets: [BidPreset!]!
  }

  type BidPresetSetting {
    id: Int!
    enabled: Boolean!
    faction: Faction!
    playerMat: PlayerMat!
  }

  type BidPreset {
    id: Int!
    name: String!
    bidPresetSettings: [BidPresetSetting!]!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    bidPresets: async () => {
      const bidPresetRepo = getRepository(BidPreset);
      const allBidPresets = await bidPresetRepo.find({
        relations: [
          'bidPresetSettings',
          'bidPresetSettings.faction',
          'bidPresetSettings.playerMat',
        ],
      });

      // Too lazy to use query builder for such a small data set
      return allBidPresets.sort((a, b) => (a.position > b.position ? 1 : -1));
    },
  },
};
