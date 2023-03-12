import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import {
  GRAPHQL_API_URL,
  INTERNAL_GRAPHQL_API_URL,
  WS_GRAPHQL_API_URL,
} from 'lib/env';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: WS_GRAPHQL_API_URL,
        })
      )
    : null;

const httpLink = new HttpLink({
  uri: INTERNAL_GRAPHQL_API_URL ? INTERNAL_GRAPHQL_API_URL : GRAPHQL_API_URL,
  credentials:
    process.env.NEXT_PUBLIC_NODE_ENV === 'production'
      ? 'same-origin'
      : 'include',
});

export default new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
    : httpLink,
  cache: new InMemoryCache(),
});
