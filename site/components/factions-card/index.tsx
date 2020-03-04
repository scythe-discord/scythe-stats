import { FunctionComponent, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { H1, LabelMedium } from 'baseui/typography';
import classNames from 'classnames';
import dynamic from 'next/dynamic';

import GQL from '../../lib/graphql';

import Card from '../card';
import FactionSnippet from './faction-snippet';
import FactionMatStats from './faction-mat-stats';

const FactionWinRates = dynamic(() => import('./faction-win-rates'), {
  ssr: false
});

const FactionWinRatesByPlayerCount = dynamic(
  () => import('./faction-win-rates-player-count'),
  {
    ssr: false
  }
);

const TOP_PLAYER_COUNT = 3;

interface Props {
  className?: string;
}

const FactionsCard: FunctionComponent<Props> = ({ className }) => {
  const [css, theme] = useStyletron();
  const [selectedFactionIdx, setSelectedFactionIdx] = useState(0);
  const onClickFaction = useCallback(
    (idx: number) => setSelectedFactionIdx(idx),
    []
  );
  const {
    data: factionsData,
    loading: factionsLoading
  } = GQL.useFactionsQuery();
  const {
    data: factionStatsData,
    loading: factionStatsLoading
  } = GQL.useFactionStatsQuery({
    variables: {
      factionId: factionsData
        ? factionsData.factions[selectedFactionIdx].id
        : 1,
      numPlayers: TOP_PLAYER_COUNT
    }
  });

  if (
    factionsLoading ||
    factionStatsLoading ||
    !factionsData ||
    !factionStatsData
  ) {
    return null;
  }

  return (
    <Card
      className={classNames(
        css({
          display: 'flex'
        }),
        className
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minWidth: 0
        })}
      >
        <div
          className={css({
            display: 'flex',
            flex: '0 0 auto',
            flexDirection: 'column',

            [theme.mediaQuery.medium]: {
              flexDirection: 'row'
            }
          })}
        >
          <FactionSnippet
            className={css({
              order: 1,

              [theme.mediaQuery.medium]: {
                flex: '1 1 auto',
                order: 0
              }
            })}
            factionStats={factionStatsData}
          />
          <div
            className={css({
              display: 'flex',
              height: '300px',
              flexDirection: 'column',
              order: 0,
              alignItems: 'center',
              margin: '0 0 50px 0',

              [theme.mediaQuery.medium]: {
                order: 1,
                flex: '1 1 325px',
                minWidth: 0,
                height: 'auto',
                margin: '0 0 0 50px'
              }
            })}
          >
            <LabelMedium
              overrides={{
                Block: {
                  style: {
                    margin: '0 0 10px'
                  }
                }
              }}
            >
              faction win rates
            </LabelMedium>
            <FactionWinRates
              factions={factionsData.factions}
              selectedFactionIdx={selectedFactionIdx}
              onClickFaction={onClickFaction}
            />
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column'
          })}
        >
          <H1
            overrides={{
              Block: {
                style: {
                  margin: '50px 0 30px'
                }
              }
            }}
          >
            Player Mat Stats
          </H1>
          <FactionMatStats factionStats={factionStatsData} />
        </div>
        <div
          className={css({
            [theme.mediaQuery.large]: {
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto'
            }
          })}
        >
          <H1
            overrides={{
              Block: {
                style: {
                  margin: '50px 0 30px'
                }
              }
            }}
          >
            Win Rates (by player count)
          </H1>
          <div
            className={css({
              height: '300px',

              [theme.mediaQuery.medium]: {
                height: '400px'
              },

              [theme.mediaQuery.large]: {
                flex: '1 1 auto'
              }
            })}
          >
            <FactionWinRatesByPlayerCount faction={factionStatsData.faction} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FactionsCard;
