import { FC, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { HeadingLarge, LabelMedium } from 'baseui/typography';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

import GQL from '../../lib/graphql';
import Card from '../card';

import FactionSnippet from './faction-snippet';
import FactionMatStats from './faction-mat-stats';

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
  const onClickFaction = useCallback(
    (idx: number) => setSelectedFactionIdx(idx),
    []
  );

  const selectedFaction = factionStats.factions[selectedFactionIdx];

  return (
    <Card
      className={classNames(
        css({
          display: 'flex',
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
          <FactionSnippet
            className={css({
              order: 1,

              [theme.mediaQuery.medium]: {
                flex: '0 1 400px',
                order: 0,
              },
            })}
            faction={selectedFaction}
            factionMatCombos={selectedFaction.factionMatCombos}
            topPlayerStats={
              selectedFaction.topPlayers.length
                ? selectedFaction.topPlayers[0]
                : null
            }
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
          <FactionMatStats
            factionMatCombos={selectedFaction.factionMatCombos}
          />
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
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FactionsCard;
