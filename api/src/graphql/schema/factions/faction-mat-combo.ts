import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Faction, PlayerMat } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    factionMatCombos(factionId: Int!): [FactionMatCombo!]!
  }

  type FactionMatCombo {
    faction: Faction!
    playerMat: PlayerMat!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    factionMatCombos: async (_, { factionId }) => {
      const factionRepo = getRepository(Faction);
      const playerMatRepo = getRepository(PlayerMat);

      const faction = await factionRepo.findOneOrFail(factionId);
      const playerMats = await playerMatRepo.find();

      return playerMats.map(playerMat => ({
        faction,
        playerMat
      }));
    }
  }
};
