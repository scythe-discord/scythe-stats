import { NextComponentType } from 'next';
import { ApolloPageContext } from 'next-with-apollo';
import { useStyletron } from 'baseui';

import { SiteHeader, TierList } from '../components';
import GQL from '../lib/graphql';

interface Props {
  tiers: GQL.TiersQuery;
  playerMats: GQL.PlayerMatsQuery;
}

const TiersPage: NextComponentType<ApolloPageContext, Props, Props> = ({
  tiers,
  playerMats,
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
        <TierList tiers={tiers} playerMats={playerMats} />
      </div>
    </div>
  );
};

TiersPage.getInitialProps = async (ctx) => {
  const apolloClient = ctx.apolloClient;

  const { data: tiers } = await apolloClient.query<
    GQL.TiersQuery,
    GQL.TiersQueryVariables
  >({
    query: GQL.TiersDocument,
  });
  const { data: playerMats } = await apolloClient.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
  });

  return {
    tiers,
    playerMats,
  };
};

export default TiersPage;
