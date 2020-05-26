import App from 'next/app';
import Head from 'next/head';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'next-with-apollo';
import { BaseProvider } from 'baseui';
import { Provider as StyletronProvider } from 'styletron-react';

import { styletron, debug } from '../styletron';
import { AuthProvider } from '../lib/auth';
import Theme from '../lib/theme';
import { GRAPHQL_API_URL } from '../lib/env';

interface Props {
  apollo: ApolloClient<any>;
}

class Site extends App<Props> {
  render() {
    const { Component, pageProps, apollo } = this.props;
    return (
      <>
        <Head>
          <title>
            Beloved Pacifist - collecting stats for Scythe, the board game
          </title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <meta
            name="description"
            content="View faction and player mat stats, recent matches, and more. Join our Discord for games and discussion. From the acclaimed board game Scythe."
          />
        </Head>
        <StyletronProvider value={styletron} debug={debug} debugAfterHydration>
          <BaseProvider theme={Theme}>
            <ApolloProvider client={apollo}>
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            </ApolloProvider>
          </BaseProvider>
        </StyletronProvider>
      </>
    );
  }
}

Site.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      new HttpLink({
        uri: GRAPHQL_API_URL,
        credentials:
          process.env.NODE_ENV === 'production' ? 'same-origin' : 'include',
      }),
    ]),
    cache: new InMemoryCache().restore(initialState || {}),
  });
})(Site);
