import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { GRAPHQL_API_URL } from 'lib/env';

export default new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: ApolloLink.from([
    new HttpLink({
      uri: GRAPHQL_API_URL,
      credentials:
        process.env.NEXT_PUBLIC_NODE_ENV === 'production'
          ? 'same-origin'
          : 'include',
    }),
  ]),
  cache: new InMemoryCache(),
});
