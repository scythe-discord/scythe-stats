import { gql } from 'graphql-tag';

import { fetchDiscordMe } from '../../../common/utils';

import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    me: User
  }

  type User {
    id: Int!
    username: String!
    discriminator: String!
    discordId: String!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    me: async (_, __, context) => {
      return fetchDiscordMe(context);
    },
  },
};
