import { FC } from 'react';
import { useStyletron } from 'baseui';
import { HeadingXLarge, HeadingSmall } from 'baseui/typography';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';
import { FactionMatImg, PlayerMatImg } from '../mat-images';

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
  const [css, theme] = useStyletron();

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
        flexDirection: 'column',

        [theme.mediaQuery.large]: {
          flexDirection: 'row',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',

          alignItems: 'center',

          [theme.mediaQuery.medium]: {
            alignItems: 'stretch',
          },
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 15px',
          })}
        >
          <FactionIcon
            className={css({
              flex: '0 0 auto',
            })}
            faction={selectedFaction.name}
            size={64}
          />
          <HeadingXLarge
            overrides={{
              Block: {
                style: {
                  margin: '0 0 0 15px',
                },
              },
            }}
          >
            {selectedFaction.name} {selectedPlayerMat.name}
          </HeadingXLarge>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,

            [theme.mediaQuery.medium]: {
              flexDirection: 'row',
              alignItems: 'center',
            },

            [theme.mediaQuery.large]: {
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          })}
        >
          <div
            className={css({
              minWidth: 0,
            })}
          >
            <FactionMatImg
              factionName={selectedFaction.name}
              className={css({
                width: '100%',
                minWidth: 0,

                [theme.mediaQuery.medium]: {
                  padding: '0 20px 0 0',
                },

                [theme.mediaQuery.large]: {
                  width: '500px',
                  padding: 0,
                },
              })}
            />
          </div>
          <div
            className={css({
              minWidth: 0,
            })}
          >
            <PlayerMatImg
              playerMatName={selectedPlayerMat.name}
              className={css({
                width: '100%',
                minWidth: 0,

                [theme.mediaQuery.large]: {
                  width: '500px',
                },
              })}
            />
          </div>
        </div>
      </div>
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
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
            margin: '0 20px 20px 0',

            [theme.mediaQuery.medium]: {
              flex: '1 1 50%',
              alignItems: 'stretch',
              margin: '0 20px 0 0',
              padding: '0 10px 0 0',
            },

            [theme.mediaQuery.large]: {
              alignItems: 'center',
            },
          })}
        >
          <HeadingSmall
            overrides={{
              Block: {
                style: {
                  margin: '0 0 20px',
                },
              },
            }}
          >
            {selectedFaction.name} win rates
          </HeadingSmall>
          <div
            className={css({
              alignSelf: 'stretch',
              height: '350px',

              [theme.mediaQuery.large]: {
                flex: '1 1 auto',
              },
            })}
          >
            <SameFactionWinRates
              combos={factionToCombos[selectedFactionId]}
              selectedPlayerMatId={selectedPlayerMatId}
              onClickMatCombo={onClickMatCombo}
            />
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,

            [theme.mediaQuery.medium]: {
              flex: '1 1 50%',
              alignItems: 'stretch',
              padding: '0 0 0 10px',
            },

            [theme.mediaQuery.large]: {
              alignItems: 'center',
            },
          })}
        >
          <HeadingSmall
            overrides={{
              Block: {
                style: {
                  margin: '0 0 20px',
                },
              },
            }}
          >
            {selectedPlayerMat.name} win rates
          </HeadingSmall>

          <div
            className={css({
              alignSelf: 'stretch',
              height: '350px',

              [theme.mediaQuery.large]: {
                flex: '1 1 auto',
              },
            })}
          >
            <SamePlayerMatWinRates
              combos={playerMatToCombos[selectedPlayerMatId]}
              selectedFactionId={selectedFactionId}
              onClickMatCombo={onClickMatCombo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatComboCompare;
