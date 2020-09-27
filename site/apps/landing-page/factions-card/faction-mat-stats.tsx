import { FC } from 'react';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';

import GQL from 'lib/graphql';

import FactionMatStatsRow from './faction-mat-stats-row';

interface Props {
  factionMatCombos: Array<
    { playerMat: Pick<GQL.PlayerMat, 'id' | 'name'> } & {
      statsByPlayerCount: Array<
        Pick<
          GQL.FactionMatComboStatsWithPlayerCount,
          | 'playerCount'
          | 'totalWins'
          | 'totalMatches'
          | 'avgCoinsOnWin'
          | 'avgRoundsOnWin'
          | 'leastRoundsForWin'
        >
      >;
    }
  >;
  selectedPlayerCounts: Set<number>;
  className?: string;
}

const FactionMatStats: FC<Props> = ({
  factionMatCombos,
  className,
  selectedPlayerCounts,
}) => {
  const rows = factionMatCombos.map(({ playerMat, statsByPlayerCount }) => {
    const relevantStats = statsByPlayerCount.filter(({ playerCount }) =>
      selectedPlayerCounts.has(playerCount)
    );
    const totalWins = relevantStats.reduce(
      (prevVal, currVal) => prevVal + currVal.totalWins,
      0
    );
    const totalMatches = relevantStats.reduce(
      (prevVal, currVal) => prevVal + currVal.totalMatches,
      0
    );
    const totalAvgCoins = relevantStats.reduce(
      (prevVal, currVal) => prevVal + currVal.avgCoinsOnWin * currVal.totalWins,
      0
    );
    const totalAvgRounds = relevantStats.reduce(
      (prevVal, currVal) =>
        prevVal + currVal.avgRoundsOnWin * currVal.totalWins,
      0
    );
    const leastRoundsForWin = relevantStats.reduce(
      (prevVal, currVal) => Math.min(prevVal, currVal.leastRoundsForWin),
      Number.MAX_SAFE_INTEGER
    );

    return {
      playerMatName: playerMat.name,
      totalWins,
      totalMatches,
      avgCoinsOnWin: totalWins > 0 ? Math.floor(totalAvgCoins / totalWins) : 0,
      avgRoundsOnWin: totalWins > 0 ? totalAvgRounds / totalWins : 0,
      leastRoundsForWin,
    };
  });

  return (
    <StyledTable
      className={className}
      $gridTemplateColumns="auto auto auto auto auto auto"
    >
      <StyledHeadCell>Player Mat</StyledHeadCell>
      <StyledHeadCell>Win Rate</StyledHeadCell>
      <StyledHeadCell>Total Matches</StyledHeadCell>
      <StyledHeadCell>Avg Coins in Wins</StyledHeadCell>
      <StyledHeadCell>Avg Rounds in Wins</StyledHeadCell>
      <StyledHeadCell>Fastest Game</StyledHeadCell>
      {rows.map((row, index) => {
        const striped = index % 2 !== 0;
        return <FactionMatStatsRow key={index} {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default FactionMatStats;
