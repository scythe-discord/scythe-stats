import { FunctionComponent, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { Card } from 'baseui/card';
import { H1 } from 'baseui/typography';

import GQL from '../../lib/graphql';

import FactionSnippet from './faction-snippet';
import FactionWinRates from './faction-win-rates';
import FactionMatStats from './faction-mat-stats';

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
    <Card
      overrides={{
        Root: {
          style: {
            padding: '25px'
          }
        }
      }}
    >
      <div
        className={css({
          display: 'flex'
        })}
      >
        <FactionSnippet
          className={css({
            minWidth: '400px'
          })}
          factionStats={factionStatsData}
        />
        <div
          className={css({
            margin: '0 0 0 50px',
            flex: '1 1 auto'
          })}
        >
          <FactionWinRates
            factions={factionsData.factions}
            selectedFactionIdx={selectedFactionIdx}
            onClickFaction={onClickFaction}
          />
        </div>
      </div>
      <H1>Player Mat Stats</H1>
      <FactionMatStats
        className={css({
          margin: '30px 0'
        })}
        factionStats={factionStatsData}
      />
    </Card>
  );
};

export default FactionsCard;
