import { gql } from 'graphql-tag';

import { scytheDb } from '../../../db';
import { PlayerMat } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    playerMat(id: Int!): PlayerMat!
    playerMats: [PlayerMat!]!
  }

  type PlayerMat {
    id: Int!
    name: String!
    abbrev: String!
    order: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    playerMat: async (_, { id }) => {
      const playerMatRepo = scytheDb.getRepository(PlayerMat);
      const playerMat = await playerMatRepo.findOneByOrFail({
        id,
      });

      return playerMat;
    },
    playerMats: async () => {
      const playerMatRepo = scytheDb.getRepository(PlayerMat);
      const allPlayerMats = await playerMatRepo.find();
      return allPlayerMats;
    },
  },
};
