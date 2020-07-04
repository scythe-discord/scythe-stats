import { FC, useMemo } from 'react';
import { useStyletron } from 'baseui';

import GQL from 'lib/graphql';

import ComboDisplay from './combo-display';
import ComboWinRatesForPlayerMat from './combo-win-rates-for-player-mat';
import ComboWinRatesForFaction from './combo-win-rates-for-faction';

interface Props {
  tiers: GQL.TiersQuery;
  selectedMatCombo: {
    factionId: number;
    playerMatId: number;
  };
  onClickMatCombo: (factionId: number, playerMatId: number) => void;
}

type AllCombosMap = {
  // By faction ID
  [key: string]: {
    // Then player mat ID
    [key: string]: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
      faction: Pick<GQL.Faction, 'id' | 'name'>;
      playerMat: Pick<GQL.PlayerMat, 'id' | 'name' | 'abbrev'>;
      topPlayers: Array<
        Pick<GQL.PlayerFactionStats, 'totalWins'> & {
          player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
        }
      >;
    };
  };
};

type FactionToCombosMap = {
  [key: string]: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name' | 'abbrev'>;
  })[];
};

type PlayerMatToCombosMap = {
  [key: string]: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name' | 'abbrev'>;
  })[];
};

const MatComboCompare: FC<Props> = ({
  tiers,
  selectedMatCombo: {
    factionId: selectedFactionId,
    playerMatId: selectedPlayerMatId,
  },
  onClickMatCombo,
}) => {
  const [css, theme] = useStyletron();

  const { allCombosMap, factionToCombos, playerMatToCombos } = useMemo(() => {
    const allCombosMap: AllCombosMap = {};

    // Used for displaying a combo's win rate, relative to other player mats
    // of the same faction
    const factionToCombos: FactionToCombosMap = {};

    // Used for displaying a combo's win rate, relative to other factions with the
    // same player mat
    const playerMatToCombos: PlayerMatToCombosMap = {};

    tiers.tiers.forEach((tier) => {
      tier.factionMatCombos.forEach((combo) => {
        if (!allCombosMap[combo.faction.id]) {
          allCombosMap[combo.faction.id] = {};
        }

        allCombosMap[combo.faction.id][combo.playerMat.id] = combo;

        if (!factionToCombos[combo.faction.id]) {
          factionToCombos[combo.faction.id] = [];
        }
        factionToCombos[combo.faction.id].push(combo);

        if (!playerMatToCombos[combo.playerMat.id]) {
          playerMatToCombos[combo.playerMat.id] = [];
        }
        playerMatToCombos[combo.playerMat.id].push(combo);
      });
    });

    return {
      allCombosMap,
      factionToCombos,
      playerMatToCombos,
    };
  }, [tiers]);

  const {
    faction: selectedFaction,
    playerMat: selectedPlayerMat,
  } = allCombosMap[selectedFactionId][selectedPlayerMatId];

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',

        [theme.mediaQuery.large]: {
          flexDirection: 'row',
        },
      })}
    >
      <ComboDisplay faction={selectedFaction} playerMat={selectedPlayerMat} />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          margin: '20px 0 0',

          [theme.mediaQuery.medium]: {
            flexDirection: 'row',
            flex: '1 1 auto',
            minWidth: 0,
          },

          [theme.mediaQuery.large]: {
            margin: '0 0 0 50px',
          },
        })}
      >
        <ComboWinRatesForFaction
          combos={factionToCombos[selectedFactionId]}
          selectedFaction={selectedFaction}
          selectedPlayerMat={selectedPlayerMat}
          onClickMatCombo={onClickMatCombo}
        />
        <ComboWinRatesForPlayerMat
          combos={playerMatToCombos[selectedPlayerMatId]}
          selectedFaction={selectedFaction}
          selectedPlayerMat={selectedPlayerMat}
          onClickMatCombo={onClickMatCombo}
        />
      </div>
    </div>
  );
};

export default MatComboCompare;
