import { NextComponentType } from 'next';
import { ApolloPageContext } from 'next-with-apollo';
import { useStyletron } from 'baseui';
import moment from 'moment';

import { TopPlayers, RecentMatches, FactionsCard } from 'apps/landing-page';
import GQL from 'lib/graphql';
import client from 'lib/apollo-client';

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
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
      })}
    >
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

export const getServerSideProps = async () => {
  const { data: factionStats } = await client.query<
    GQL.FactionStatsQuery,
    GQL.FactionStatsQueryVariables
  >({
    query: GQL.FactionStatsDocument,
  });
  const { data: playerMats } = await client.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
  });
  const { data: topPlayersAllTime } = await client.query<
    GQL.TopPlayersQuery,
    GQL.TopPlayersQueryVariables
  >({
    query: GQL.TopPlayersDocument,
    variables: {
      first: 5,
    },
  });
  const { data: topPlayersMonthly } = await client.query<
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
    props: {
      factionStats,
      playerMats,
      topPlayersAllTime,
      topPlayersMonthly,
      initialApolloState: client.cache.extract(),
    },
  };
};

export default HomePage;
