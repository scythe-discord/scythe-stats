import { ApolloServer } from 'apollo-server';

import { GRAPHQL_SERVER_BASIC_AUTH } from '../common/config';

import schema from './schema';

export const graphqlServer = new ApolloServer({
  ...schema,
  context: ({ req }) => {
    // Is this a great way to handle this...?
    // Nope! But it'll do for now
    let isAdmin = false;
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      const basicAuth = Buffer.from(parts[1], 'base64').toString();

      isAdmin = basicAuth === GRAPHQL_SERVER_BASIC_AUTH;
    }

    return {
      isAdmin
    };
  }
});
