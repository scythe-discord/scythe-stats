import { FunctionComponent, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { H1, LabelMedium } from 'baseui/typography';

import GQL from '../../lib/graphql';

import Card from '../card';
import FactionSnippet from './faction-snippet';
import FactionWinRates from './faction-win-rates';
import FactionMatStats from './faction-mat-stats';
import FactionWinRatesByPlayerCount from './faction-win-rates-player-count';

const TOP_PLAYER_COUNT = 3;

const FactionsCard: FunctionComponent = () => {
  const [css] = useStyletron();
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
    <Card>
      <div
        className={css({
          display: 'flex'
        })}
      >
        <FactionSnippet
          className={css({
            flex: '1 1 auto'
          })}
          factionStats={factionStatsData}
        />
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 0 0 50px',
            flex: '0 0 auto'
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
      <FactionWinRatesByPlayerCount faction={factionStatsData.faction} />
    </Card>
  );
};

export default FactionsCard;
