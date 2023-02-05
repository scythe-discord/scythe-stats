import { gql } from 'graphql-tag';
import { connectionFromArray } from 'graphql-relay';

import { scytheDb } from '../../../db';
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
      const playerRepository = scytheDb.getRepository(Player);
      // Caveat: ILIKE only available in Postgres
      const query = playerRepository
        .createQueryBuilder('player')
        .where(`player."displayName" ILIKE '%${startsWith}%'`);
      const players = await query.getMany();
      return connectionFromArray(players, { first, after });
    },
  },
};
