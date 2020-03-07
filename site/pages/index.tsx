import { NextComponentType } from 'next';
import { useStyletron } from 'baseui';
import { ApolloPageContext } from 'next-with-apollo';
import moment from 'moment';

import {
  SiteHeader,
  TopPlayers,
  RecentMatches,
  FactionsCard
} from '../components';
import GQL from '../lib/graphql';

interface Props {
  factionStats: GQL.FactionStatsQuery;
  recentMatches: GQL.MatchesQuery;
  topPlayersAllTime: GQL.TopPlayersQuery;
  topPlayersMonthly: GQL.TopPlayersQuery;
}

const HomePage: NextComponentType<ApolloPageContext, Props, Props> = ({
  factionStats,
  recentMatches,
  topPlayersMonthly,
  topPlayersAllTime
}) => {
  const [css, theme] = useStyletron();

  return (
    <div>
      <SiteHeader />
      <div
        className={css({
          padding: '20px 0',
          margin: '0 auto',
          width: '100%',

          [theme.mediaQuery.large]: {
            padding: '20px',
            maxWidth: '1650px'
          }
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',

            [theme.mediaQuery.large]: {
              flexDirection: 'row'
            }
          })}
        >
          <div
            className={css({
              display: 'flex',
              flex: '1 1 auto',
              margin: '25px 0',
              minWidth: 0,

              [theme.mediaQuery.large]: {
                margin: '0 25px 0 0'
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
            <RecentMatches recentMatches={recentMatches} />
            <div
              className={css({
                margin: '25px 0 0'
              })}
            >
              <TopPlayers
                topPlayersAllTime={topPlayersAllTime}
                topPlayersMonthly={topPlayersMonthly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HomePage.getInitialProps = async ctx => {
  const apolloClient = ctx.apolloClient;

  const { data: factionStats } = await apolloClient.query<
    GQL.FactionStatsQuery,
    GQL.FactionStatsQueryVariables
  >({
    query: GQL.FactionStatsDocument,
    variables: {
      numTopPlayers: 1
    }
  });
  const { data: recentMatches } = await apolloClient.query<
    GQL.MatchesQuery,
    GQL.MatchesQueryVariables
  >({
    query: GQL.MatchesDocument,
    variables: {
      first: 10
    }
  });
  const { data: topPlayersAllTime } = await apolloClient.query<
    GQL.TopPlayersQuery,
    GQL.TopPlayersQueryVariables
  >({
    query: GQL.TopPlayersDocument,
    variables: {
      first: 5
    }
  });
  const { data: topPlayersMonthly } = await apolloClient.query<
    GQL.TopPlayersQuery,
    GQL.TopPlayersQueryVariables
  >({
    query: GQL.TopPlayersDocument,
    variables: {
      first: 5,
      fromDate: moment()
        .subtract(1, 'month')
        .toISOString()
    }
  });

  return {
    factionStats,
    recentMatches,
    topPlayersAllTime,
    topPlayersMonthly
  };
};

export default HomePage;
