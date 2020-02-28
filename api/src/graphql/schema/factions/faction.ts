import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Faction, Pl } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    faction(name: String!): Faction
    factions: [Faction!]!
  }

  type Faction {
    id: Int!
    name: String!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    faction: async (_, { name }) => {
      const factionRepo = getRepository(Faction);
      const faction = await factionRepo.findOne({
        name
      });

      return faction || null;
    },
    factions: async () => {
      const factionRepo = getRepository(Faction);
      const allFactions = await factionRepo.find();
      return allFactions;
    }
  }
};
