import { ApolloServer } from 'apollo-server-express';

import { resolveContext } from './context';
import schema from './schema';

export const graphqlServer = new ApolloServer({
  ...schema,
  context: resolveContext,
});
