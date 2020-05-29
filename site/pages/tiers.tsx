import { useCallback, useState } from 'react';
import { NextComponentType } from 'next';
import { ApolloPageContext } from 'next-with-apollo';
import { useStyletron } from 'baseui';

import { SiteHeader, TierList, MatComboCompare } from '../components';
import GQL from '../lib/graphql';

interface Props {
  tiers: GQL.TiersQuery;
  playerMats: GQL.PlayerMatsQuery;
  initialMatCombo: {
    factionId: number;
    playerMatId: number;
  };
}

const TiersPage: NextComponentType<ApolloPageContext, Props, Props> = ({
  tiers,
  playerMats,
  initialMatCombo,
}) => {
  const [css, theme] = useStyletron();

  const [selectedMatCombo, setSelectedMatCombo] = useState<{
    factionId: number;
    playerMatId: number;
  }>(initialMatCombo);

  const onClickMatCombo = useCallback(
    (factionId: number, playerMatId: number) => {
      setSelectedMatCombo({
        factionId,
        playerMatId,
      });
    },
    []
  );

  return (
    <div
      className={css({
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
      })}
    >
      <SiteHeader />
      <div
        className={css({
          padding: '10px',
          margin: '0 auto',
          width: '100%',

          [theme.mediaQuery.medium]: {
            padding: '20px',
          },

          [theme.mediaQuery.large]: {
            maxWidth: '1650px',
          },
        })}
      >
        <TierList
          tiers={tiers}
          playerMats={playerMats}
          selectedMatCombo={selectedMatCombo}
          onClickMatCombo={onClickMatCombo}
        />
        <div
          className={css({
            padding: '50px 0',
          })}
        >
          <MatComboCompare
            tiers={tiers}
            selectedMatCombo={selectedMatCombo}
            onClickMatCombo={onClickMatCombo}
          />
        </div>
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
    variables: {
      numTopPlayers: 1,
    },
  });
  const { data: playerMats } = await apolloClient.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
  });

  const randomTier =
    tiers.tiers[Math.floor(Math.random() * tiers.tiers.length)];
  const randomMatCombo =
    randomTier.factionMatCombos[
      Math.floor(Math.random() * randomTier.factionMatCombos.length)
    ];

  return {
    tiers,
    playerMats,
    initialMatCombo: {
      factionId: randomMatCombo.faction.id,
      playerMatId: randomMatCombo.playerMat.id,
    },
  };
};

export default TiersPage;
