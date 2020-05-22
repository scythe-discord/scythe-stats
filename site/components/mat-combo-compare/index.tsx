import { FC } from 'react';
import { useStyletron } from 'baseui';
import { HeadingXLarge, HeadingXSmall } from 'baseui/typography';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

import ComboSnippet from './combo-snippet';
import SamePlayerMatWinRates from './same-player-mat-win-rates';
import SameFactionWinRates from './same-faction-win-rates';

interface Props {
  tiers: GQL.TiersQuery;
  selectedMatCombo: {
    factionId: number;
    playerMatId: number;
  };
  onClickMatCombo: (factionId: number, playerMatId: number) => void;
}

const MatComboCompare: FC<Props> = ({
  tiers,
  selectedMatCombo: {
    factionId: selectedFactionId,
    playerMatId: selectedPlayerMatId,
  },
  onClickMatCombo,
}) => {
  const [css] = useStyletron();

  const factionCombosMap: {
    [key: string]: {
      [key: string]: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
        faction: Pick<GQL.Faction, 'id' | 'name'>;
        playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
        topPlayers: Array<
          Pick<GQL.PlayerFactionStats, 'totalWins'> & {
            player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
          }
        >;
      };
    };
  } = {};

  const factionComboToTier: {
    [key: string]: {
      [key: string]: Pick<GQL.Tier, 'id' | 'name' | 'rank'>;
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

  tiers.tiers.forEach((tier) => {
    tier.factionMatCombos.forEach((combo) => {
      if (!factionCombosMap[combo.faction.id]) {
        factionCombosMap[combo.faction.id] = {};
      }

      factionCombosMap[combo.faction.id][combo.playerMat.id] = combo;

      if (!factionComboToTier[combo.faction.id]) {
        factionComboToTier[combo.faction.id] = {};
      }

      factionComboToTier[combo.faction.id][combo.playerMat.id] = tier;

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
    <div
      className={css({
        display: 'flex',
        minHeight: '400px',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 30px',
          })}
        >
          <FactionIcon
            className={css({
              margin: '0 15px 0 0',
              flex: '0 0 auto',
            })}
            faction={selectedFaction.name}
            size={64}
          />
          <HeadingXLarge
            overrides={{
              Block: {
                style: {
                  flex: '0 0 auto',
                  margin: 0,
                },
              },
            }}
          >
            {selectedFaction.name} {selectedPlayerMat.name}
          </HeadingXLarge>
        </div>
        <ComboSnippet
          className={css({
            minWidth: '350px',
          })}
          combo={factionCombosMap[selectedFactionId][selectedPlayerMatId]}
          tier={factionComboToTier[selectedFactionId][selectedPlayerMatId]}
        />
      </div>
      <div
        className={css({
          display: 'flex',
          flex: '1 1 auto',
          margin: '0 0 0 50px',
          minWidth: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 1 65%',
            minWidth: 0,
            height: '100%',
          })}
        >
          <HeadingXSmall
            overrides={{
              Block: {
                style: {
                  margin: '0 0 20px',
                },
              },
            }}
          >
            {selectedFaction.name} win rates
          </HeadingXSmall>
          <SameFactionWinRates
            combos={factionToCombos[selectedFactionId]}
            selectedPlayerMatId={selectedPlayerMatId}
            onClickMatCombo={onClickMatCombo}
          />
        </div>
        <div
          className={css({
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 1 35%',
            minWidth: 0,
            height: '100%',
          })}
        >
          <HeadingXSmall
            overrides={{
              Block: {
                style: {
                  margin: '0 0 20px',
                },
              },
            }}
          >
            {selectedPlayerMat.name} win rates
          </HeadingXSmall>
          <SamePlayerMatWinRates
            combos={playerMatToCombos[selectedPlayerMatId]}
            selectedFactionId={selectedFactionId}
            onClickMatCombo={onClickMatCombo}
          />
        </div>
      </div>
    </div>
  );
};

export default MatComboCompare;
