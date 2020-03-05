import { FunctionComponent } from 'react';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';

import GQL from '../../lib/graphql';

import FactionMatStatsRow from './faction-mat-stats-row';

interface Props {
  factionMatCombos: Array<
    Pick<
      GQL.FactionMatCombo,
      | 'totalWins'
      | 'totalMatches'
      | 'avgCoinsOnWin'
      | 'avgRoundsOnWin'
      | 'leastRoundsForWin'
    > & { playerMat: Pick<GQL.PlayerMat, 'id' | 'name'> }
  >;
  className?: string;
}

const FactionSnippet: FunctionComponent<Props> = ({
  factionMatCombos,
  className
}) => {
  const rows = factionMatCombos.map(
    ({
      playerMat,
      totalWins,
      totalMatches,
      avgCoinsOnWin,
      avgRoundsOnWin,
      leastRoundsForWin
    }) => {
      return {
        playerMatName: playerMat.name,
        totalWins,
        totalMatches,
        avgCoinsOnWin,
        avgRoundsOnWin,
        leastRoundsForWin
      };
    }
  );

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
        const striped = index % 2 === 0;
        return <FactionMatStatsRow key={index} {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default FactionSnippet;
