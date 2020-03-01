import { FC } from 'react';
import { withStyle } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

interface Props {
  striped: boolean;
  playerMatName: string;
  totalWins: number;
  totalMatches: number;
  avgCoinsOnWin: number;
  avgRoundsOnWin: number;
  leastRoundsForWin: number;
}

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center'
});

const FactionMatStatsRow: FC<Props> = ({
  striped,
  playerMatName,
  totalWins,
  totalMatches,
  avgCoinsOnWin,
  avgRoundsOnWin,
  leastRoundsForWin
}) => {
  const winRate = (100 * totalWins) / totalMatches;

  return (
    <>
      <CenteredBodyCell $striped={striped}>{playerMatName}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {`${winRate.toFixed(2)}%`}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{totalMatches}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{avgCoinsOnWin}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {avgRoundsOnWin.toFixed(2)}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {`${leastRoundsForWin} rounds`}
      </CenteredBodyCell>
    </>
  );
};

export default FactionMatStatsRow;
