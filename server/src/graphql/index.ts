import { ApolloServer } from 'apollo-server';

import schema from './schema';

export const graphqlServer = new ApolloServer(schema);
