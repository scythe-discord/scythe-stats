import { MatchHistory } from 'apps/bid';
import { useStyletron } from 'baseui';
import { NextComponentType } from 'next';
import { BaseContext } from 'next/dist/shared/lib/utils';

import client from 'lib/apollo-client';
import GQL from 'lib/graphql';

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  bidPresets: GQL.BidPresetsQuery;
}

const BidderPage: NextComponentType<BaseContext, Props, Props> = ({
  factions,
  playerMats,
  bidPresets,
}) => {
  const [css, theme] = useStyletron();

  return (
    <div
      className={css({
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
      })}
    >
      <MatchHistory
        factions={factions}
        playerMats={playerMats}
        bidPresets={bidPresets}
      />
    </div>
  );
};

export const getServerSideProps = async () => {
  const { data: factions } = await client.query<
    GQL.FactionsQuery,
    GQL.FactionsQueryVariables
  >({
    query: GQL.FactionsDocument,
  });
  const { data: playerMats } = await client.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
  });
  const { data: bidPresets } = await client.query<GQL.BidPresetsQuery>({
    query: GQL.BidPresetsDocument,
  });

  return {
    props: {
      factions,
      playerMats,
      bidPresets,
      initialApolloState: client.cache.extract(),
    },
  };
};

export default BidderPage;
