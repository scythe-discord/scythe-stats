import { gql } from 'apollo-server-express';

import { fetchDiscordMe } from '../../../common/utils';

import { Context } from '../../context';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    discordMe: DiscordUser
  }

  type DiscordUser {
    id: String!
    username: String!
    discriminator: String!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    discordMe: async (_, __, context: Context) => {
      return fetchDiscordMe(context);
    },
  },
};
