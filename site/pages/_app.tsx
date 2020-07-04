import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'next-with-apollo';
import { BaseProvider } from 'baseui';
import { ToasterContainer } from 'baseui/toast';
import { Provider as StyletronProvider } from 'styletron-react';

import { styletron, debug } from '../styletron';
import { AuthProvider, SiteHeader } from '../lib/components';
import Theme from '../lib/theme';
import { GRAPHQL_API_URL } from '../lib/env';
import * as gtag from '../lib/gtag';

interface Props {
  apollo: ApolloClient<any>;
  initAuthCheck: boolean;
}

const handleRouteChange = (url: string) => {
  gtag.pageview(url);
};

class Site extends App<Props> {
  componentDidMount() {
    Router.events.on('routeChangeComplete', handleRouteChange);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', handleRouteChange);
  }

  render() {
    const { Component, pageProps, apollo, initAuthCheck } = this.props;
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
              <AuthProvider initAuthCheck={initAuthCheck}>
                <ToasterContainer>
                  <SiteHeader />
                  <Component {...pageProps} />
                </ToasterContainer>
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

  const initAuthCheck = !!(
    appContext.ctx.req && appContext.ctx.req.headers.cookie
  );

  return { ...appProps, initAuthCheck };
};

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
          return;
        }

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
          process.env.NEXT_PUBLIC_NODE_ENV === 'production'
            ? 'same-origin'
            : 'include',
      }),
    ]),
    cache: new InMemoryCache().restore(initialState || {}),
  });
})(Site);
