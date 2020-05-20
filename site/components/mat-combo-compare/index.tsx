import { FC } from 'react';
import { useStyletron } from 'baseui';
import { HeadingXLarge } from 'baseui/typography';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

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
      [key: string]: Pick<
        GQL.FactionMatCombo,
        | 'totalWins'
        | 'totalMatches'
        | 'avgCoinsOnWin'
        | 'avgRoundsOnWin'
        | 'leastRoundsForWin'
      > & {
        faction: Pick<GQL.Faction, 'id' | 'name'>;
        playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
      };
    };
  } = {};

  // Used for displaying a combo's win rate, relative to other player mats
  // of the same faction
  const factionToCombos: {
    [key: string]: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'>[];
  } = {};

  // Used for displaying a combo's win rate, relative to other factions with the
  // same player mat
  const playerMatToCombos: {
    [key: string]: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'>[];
  } = {};

  tiers.tiers.forEach(({ factionMatCombos }) => {
    factionMatCombos.forEach((combo) => {
      if (!factionCombosMap[combo.faction.id]) {
        factionCombosMap[combo.faction.id] = {};
      }

      factionCombosMap[combo.faction.id][combo.playerMat.id] = combo;
    });

    tiers.tiers.forEach(({ factionMatCombos }) => {
      factionMatCombos.forEach((combo) => {
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
    </>
  );
};

export default MatComboCompare;
