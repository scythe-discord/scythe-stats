import { NextComponentType } from 'next';
import { useStyletron } from 'baseui';
import { ApolloPageContext } from 'next-with-apollo';

import {
  SiteHeader,
  TopPlayers,
  RecentMatches,
  FactionsCard
} from '../components';
import {
  FactionStatsDocument,
  FactionStatsQuery,
  FactionStatsQueryVariables
} from '../lib/graphql/codegen';

const HomePage: NextComponentType<
  ApolloPageContext,
  FactionStatsQuery,
  FactionStatsQuery
> = factionStats => {
  const [css, theme] = useStyletron();

  return (
    <div>
      <SiteHeader />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          margin: '0 auto',
          width: '100%',

          [theme.mediaQuery.large]: {
            flexDirection: 'row',
            padding: '20px',
            maxWidth: '1650px'
          }
        })}
      >
        <div
          className={css({
            display: 'flex',
            flex: '1 1 auto',
            margin: '20px 0',
            minWidth: 0,

            [theme.mediaQuery.large]: {
              margin: '0 50px 0 0'
            }
          })}
        >
          <FactionsCard
            factionStats={factionStats}
            className={css({
              flex: '1 1 auto',
              minWidth: 0
            })}
          />
        </div>
        <div>
          <RecentMatches />
          <div
            className={css({
              margin: '50px 0 0'
            })}
          >
            <TopPlayers />
          </div>
        </div>
      </div>
    </div>
  );
};

HomePage.getInitialProps = async ctx => {
  const apolloClient = ctx.apolloClient;
  const { data } = await apolloClient.query<
    FactionStatsQuery,
    FactionStatsQueryVariables
  >({
    query: FactionStatsDocument,
    variables: {
      numTopPlayers: 1
    }
  });

  return data;
};

export default HomePage;
