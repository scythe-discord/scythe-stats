import { FC } from 'react';
import { withStyle } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center',
});

interface Props {
  striped: boolean;
  displayName: string;
  totalWins: number;
  totalMatches: number;
}

const PlayerRow: FC<Props> = ({
  striped,
  displayName,
  totalWins,
  totalMatches,
}) => {
  const winRate = ((100 * totalWins) / totalMatches).toFixed(2);

  return (
    <>
      <CenteredBodyCell $striped={striped}>{displayName}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{totalWins}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{winRate}%</CenteredBodyCell>
    </>
  );
};

export default PlayerRow;
