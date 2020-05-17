import { NextComponentType } from 'next';
import { ApolloPageContext } from 'next-with-apollo';
import { useStyletron } from 'baseui';
import moment from 'moment';

import {
  SiteHeader,
  TopPlayers,
  RecentMatches,
  FactionsCard,
} from '../components';
import GQL from '../lib/graphql';

interface Props {
  factionStats: GQL.FactionStatsQuery;
  playerMats: GQL.PlayerMatsQuery;
  topPlayersAllTime: GQL.TopPlayersQuery;
  topPlayersMonthly: GQL.TopPlayersQuery;
}

const HomePage: NextComponentType<ApolloPageContext, Props, Props> = ({
  factionStats,
  playerMats,
  topPlayersMonthly,
  topPlayersAllTime,
}) => {
  const [css, theme] = useStyletron();

  return (
    <div
      className={css({
        backgroundColor: theme.colors.backgroundPrimary,
      })}
    >
      <SiteHeader />
      <div
        className={css({
          padding: 0,
          margin: '0 auto',
          width: '100%',

          [theme.mediaQuery.medium]: {
            padding: '20px 0',
          },

          [theme.mediaQuery.large]: {
            padding: '20px',
            maxWidth: '1650px',
          },
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',

            [theme.mediaQuery.large]: {
              flexDirection: 'row',
            },
          })}
        >
          <div
            className={css({
              display: 'flex',
              flex: '1 1 auto',
              margin: '0 0 25px',
              minWidth: 0,

              [theme.mediaQuery.large]: {
                margin: '0 25px 0 0',
              },
            })}
          >
            <FactionsCard
              factionStats={factionStats}
              className={css({
                flex: '1 1 auto',
                minWidth: 0,
              })}
            />
          </div>
          <div>
            <RecentMatches
              factionStats={factionStats}
              playerMats={playerMats}
            />
            <div
              className={css({
                margin: '25px 0 0',
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

HomePage.getInitialProps = async (ctx) => {
  const apolloClient = ctx.apolloClient;

  const { data: factionStats } = await apolloClient.query<
    GQL.FactionStatsQuery,
    GQL.FactionStatsQueryVariables
  >({
    query: GQL.FactionStatsDocument,
    variables: {
      numTopPlayers: 1,
    },
  });
  const { data: playerMats } = await apolloClient.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
  });
  const { data: topPlayersAllTime } = await apolloClient.query<
    GQL.TopPlayersQuery,
    GQL.TopPlayersQueryVariables
  >({
    query: GQL.TopPlayersDocument,
    variables: {
      first: 5,
    },
  });
  const { data: topPlayersMonthly } = await apolloClient.query<
    GQL.TopPlayersQuery,
    GQL.TopPlayersQueryVariables
  >({
    query: GQL.TopPlayersDocument,
    variables: {
      first: 5,
      fromDate: moment().subtract(1, 'month').toISOString(),
    },
  });

  return {
    factionStats,
    playerMats,
    topPlayersAllTime,
    topPlayersMonthly,
  };
};

export default HomePage;
