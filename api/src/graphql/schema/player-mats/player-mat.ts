import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

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
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    playerMat: async (_, { id }) => {
      const playerMatRepo = getRepository(PlayerMat);
      const playerMat = await playerMatRepo.findOneOrFail({
        id,
      });

      return playerMat;
    },
    playerMats: async () => {
      const playerMatRepo = getRepository(PlayerMat);
      const allPlayerMats = await playerMatRepo.find();
      return allPlayerMats;
    },
  },
};
