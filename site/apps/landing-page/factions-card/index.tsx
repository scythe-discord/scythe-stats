import { FC, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { HeadingLarge, HeadingXXLarge, LabelMedium } from 'baseui/typography';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

import GQL from 'lib/graphql';
import { FactionIcon } from 'lib/components';

import Card from '../card';
import PlayerCountFilter from './player-count-filter';
import FactionSnippet from './faction-snippet';
import FactionMatStats from './faction-mat-stats';
import { Block } from 'baseui/block';

// Responsive chart containers don't play well with SSR
const FactionWinRates = dynamic(() => import('./faction-win-rates'), {
  ssr: false,
});

const FactionWinRatesByPlayerCount = dynamic(
  () => import('./faction-win-rates-player-count'),
  {
    ssr: false,
  }
);

interface Props {
  factionStats: GQL.FactionStatsQuery;
  className?: string;
}

const FactionsCard: FC<Props> = ({ factionStats, className }) => {
  const [css, theme] = useStyletron();
  const [selectedFactionIdx, setSelectedFactionIdx] = useState(0);
  const [selectedPlayerCounts, setSelectedPlayerCounts] = useState(
    new Set([3, 4])
  );
  const {
    loading: topPlayersLoading,
    data: topPlayers,
    refetch: refetchFactionStatsByPlayerCount,
  } = GQL.useFactionTopPlayersQuery({
    variables: {
      numTopPlayers: 1,
      playerCounts: Array.from(selectedPlayerCounts),
    },
  });

  const onClickFaction = useCallback(
    (idx: number) => setSelectedFactionIdx(idx),
    []
  );

  const onClickPlayerCount = (playerCount: number) => {
    const nextSelectedPlayerCounts = new Set(selectedPlayerCounts);
    if (!selectedPlayerCounts.has(playerCount)) {
      nextSelectedPlayerCounts.add(playerCount);
    } else if (selectedPlayerCounts.size > 1) {
      nextSelectedPlayerCounts.delete(playerCount);
    }

    setSelectedPlayerCounts(nextSelectedPlayerCounts);
    refetchFactionStatsByPlayerCount({
      numTopPlayers: 1,
      playerCounts: Array.from(nextSelectedPlayerCounts),
    });
  };

  const selectedFaction = factionStats.factions[selectedFactionIdx];

  let topPlayerStats = null;
  if (topPlayers) {
    const relevantFaction = topPlayers.factions.find(
      ({ id }) => id === selectedFaction.id
    );
    topPlayerStats =
      relevantFaction && relevantFaction.topPlayers.length
        ? relevantFaction.topPlayers[0]
        : null;
  }

  return (
    <Card
      className={classNames(
        css({
          display: 'flex',
          position: 'relative',
        }),
        className
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minWidth: 0,
        })}
      >
        <Block
          display={['none', 'none', 'flex']}
          alignItems="center"
          marginBottom="20px"
        >
          <FactionIcon
            faction={selectedFaction.name}
            size={72}
            className={css({
              padding: '0 20px 0 0',
            })}
          />
          <HeadingXXLarge
            overrides={{
              Block: {
                style: {
                  margin: 0,
                  flexGrow: 1,
                },
              },
            }}
          >
            {selectedFaction.name}
          </HeadingXXLarge>
          <PlayerCountFilter
            className={css({
              alignSelf: 'flex-start',
            })}
            selectedPlayerCounts={selectedPlayerCounts}
            onClickPlayerCount={onClickPlayerCount}
          />
        </Block>
        <div
          className={css({
            display: 'flex',
            flex: '0 0 auto',
            flexDirection: 'column',

            [theme.mediaQuery.medium]: {
              flexDirection: 'row',
            },
          })}
        >
          <Block
            display={['flex', 'flex', 'none']}
            overrides={{
              Block: {
                style: {
                  order: 0,
                  margin: '0 0 25px 0',
                },
              },
            }}
          >
            <PlayerCountFilter
              selectedPlayerCounts={selectedPlayerCounts}
              onClickPlayerCount={onClickPlayerCount}
            />
          </Block>
          <Block
            display={['flex', 'flex', 'none']}
            alignItems="center"
            overrides={{
              Block: {
                style: {
                  order: 2,
                },
              },
            }}
          >
            <FactionIcon
              faction={selectedFaction.name}
              size={72}
              className={css({
                padding: '0 20px 0 0',
              })}
            />
            <HeadingXXLarge
              overrides={{
                Block: {
                  style: {
                    margin: 0,
                  },
                },
              }}
            >
              {selectedFaction.name}
            </HeadingXXLarge>
          </Block>
          <FactionSnippet
            className={css({
              order: 3,

              [theme.mediaQuery.medium]: {
                flex: '0 1 400px',
                order: 1,
              },
            })}
            faction={selectedFaction}
            factionMatCombos={selectedFaction.factionMatCombos}
            topPlayerStats={topPlayerStats}
            topPlayerStatsLoading={topPlayersLoading}
            selectedPlayerCounts={selectedPlayerCounts}
          />
          <div
            className={css({
              display: 'flex',
              height: '300px',
              flexDirection: 'column',
              order: 1,
              alignItems: 'center',
              margin: '0 0 50px 0',

              [theme.mediaQuery.medium]: {
                order: 3,
                flex: '1 1 325px',
                minWidth: 0,
                height: 'auto',
                margin: '0 0 0 50px',
              },
            })}
          >
            <LabelMedium
              overrides={{
                Block: {
                  style: {
                    margin: '0 0 10px',
                  },
                },
              }}
            >
              faction win rates
            </LabelMedium>
            <FactionWinRates
              factions={factionStats.factions}
              selectedFactionIdx={selectedFactionIdx}
              selectedPlayerCounts={selectedPlayerCounts}
              onClickFaction={onClickFaction}
            />
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <HeadingLarge
            as="h1"
            overrides={{
              Block: {
                style: {
                  margin: '30px 0',
                },
              },
            }}
          >
            Player Mat Stats
          </HeadingLarge>
          <div>
            <FactionMatStats
              factionMatCombos={selectedFaction.factionMatCombos}
              selectedPlayerCounts={selectedPlayerCounts}
            />
          </div>
        </div>
        <div
          className={css({
            [theme.mediaQuery.large]: {
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
            },
          })}
        >
          <HeadingLarge
            as="h1"
            overrides={{
              Block: {
                style: {
                  margin: '30px 0',
                },
              },
            }}
          >
            Win Rates (by player count)
          </HeadingLarge>
          <div
            className={css({
              height: '300px',

              [theme.mediaQuery.medium]: {
                height: '400px',
              },

              [theme.mediaQuery.large]: {
                flex: '1 1 auto',
              },
            })}
          >
            <FactionWinRatesByPlayerCount
              factionStatsByPlayerCount={selectedFaction.statsByPlayerCount}
              selectedPlayerCounts={selectedPlayerCounts}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FactionsCard;
