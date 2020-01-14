import { ApolloServer } from 'apollo-server-express';

import schema from './schema';

export const graphqlServer = new ApolloServer(schema);
