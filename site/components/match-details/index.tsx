import { FC } from 'react';
import { withStyle } from 'baseui';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';

import MatchRow from './match-row';

const CenteredHeadCell = withStyle(StyledHeadCell, {
  display: 'flex',
  alignItems: 'center',
});

export interface MatchDetailsRow {
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
}

interface Props {
  rows: MatchDetailsRow[];
  className?: string;
}

export const MatchDetails: FC<Props> = ({ rows, className }) => {
  return (
    <StyledTable
      className={className}
      $gridTemplateColumns="auto 150px 150px 75px"
    >
      <CenteredHeadCell>Player</CenteredHeadCell>
      <CenteredHeadCell>Faction</CenteredHeadCell>
      <CenteredHeadCell>Player Mat</CenteredHeadCell>
      <CenteredHeadCell>Coins</CenteredHeadCell>
      {rows.map((row, index) => {
        const striped = index % 2 !== 0;
        return <MatchRow key={index} {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};
