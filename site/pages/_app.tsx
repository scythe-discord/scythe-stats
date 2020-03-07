import App from 'next/app';
import Head from 'next/head';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'next-with-apollo';
import { BaseProvider } from 'baseui';
import { Provider as StyletronProvider } from 'styletron-react';
import 'react-perfect-scrollbar/dist/css/styles.css';

import { styletron, debug } from '../styletron';
import Theme from '../lib/theme';

interface Props {
  apollo: ApolloClient<any>;
}

class Site extends App<Props> {
  render() {
    const { Component, pageProps, apollo } = this.props;
    return (
      <>
        <Head>
          <title>Beloved Pacifist</title>
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
              <Component {...pageProps} />
            </ApolloProvider>
          </BaseProvider>
        </StyletronProvider>
      </>
    );
  }
}

Site.getInitialProps = async appContext => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache().restore(initialState || {})
  });
})(Site);
