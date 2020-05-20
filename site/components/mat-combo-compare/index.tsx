import { FC } from 'react';
import { useStyletron } from 'baseui';
import { HeadingXLarge } from 'baseui/typography';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

import SamePlayerMatWinRates from './same-player-mat-win-rates';
import SameFactionWinRates from './same-faction-win-rates';

interface Props {
  tiers: GQL.TiersQuery;
  selectedMatCombo: {
    factionId: number;
    playerMatId: number;
  };
}

const MatComboCompare: FC<Props> = ({
  tiers,
  selectedMatCombo: {
    factionId: selectedFactionId,
    playerMatId: selectedPlayerMatId,
  },
}) => {
  const [css] = useStyletron();

  const factionCombosMap: {
    [key: string]: {
      [key: string]: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
        faction: Pick<GQL.Faction, 'id' | 'name'>;
        playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
      };
    };
  } = {};

  // Used for displaying a combo's win rate, relative to other player mats
  // of the same faction
  const factionToCombos: {
    [key: string]: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
      faction: Pick<GQL.Faction, 'id' | 'name'>;
      playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
    })[];
  } = {};

  // Used for displaying a combo's win rate, relative to other factions with the
  // same player mat
  const playerMatToCombos: {
    [key: string]: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
      faction: Pick<GQL.Faction, 'id' | 'name'>;
      playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
    })[];
  } = {};

  tiers.tiers.forEach(({ factionMatCombos }) => {
    factionMatCombos.forEach((combo) => {
      if (!factionCombosMap[combo.faction.id]) {
        factionCombosMap[combo.faction.id] = {};
      }

      factionCombosMap[combo.faction.id][combo.playerMat.id] = combo;
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

  const {
    faction: selectedFaction,
    playerMat: selectedPlayerMat,
  } = factionCombosMap[selectedFactionId][selectedPlayerMatId];

  return (
    <>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
        })}
      >
        <FactionIcon
          className={css({
            margin: '0 15px 0 0',
          })}
          faction={selectedFaction.name}
          size={64}
        />
        <HeadingXLarge>
          {selectedFaction.name} {selectedPlayerMat.name}
        </HeadingXLarge>
      </div>
      <div
        className={css({
          display: 'flex',
          height: '500px',
        })}
      >
        <SamePlayerMatWinRates
          combos={playerMatToCombos[selectedPlayerMatId]}
          selectedFactionId={selectedFactionId}
        />
        <SameFactionWinRates
          combos={factionToCombos[selectedFactionId]}
          selectedPlayerMatId={selectedPlayerMatId}
        />
      </div>
    </>
  );
};

export default MatComboCompare;
