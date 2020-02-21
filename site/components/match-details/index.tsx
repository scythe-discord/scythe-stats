import { FunctionComponent } from 'react';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';

import MatchRow from './match-row';

interface MatchDetailsRow {
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
}

interface Props {
  rows: MatchDetailsRow[];
  className?: string;
}

const MatchList: FunctionComponent<Props> = ({ rows, className }) => {
  return (
    <StyledTable
      className={className}
      $gridTemplateColumns="minmax(auto, 175px) 150px 150px auto"
    >
      <StyledHeadCell>Player</StyledHeadCell>
      <StyledHeadCell>Faction</StyledHeadCell>
      <StyledHeadCell>Player Mat</StyledHeadCell>
      <StyledHeadCell>Coins</StyledHeadCell>
      {rows.map((row, index) => {
        const striped = index % 2 === 0;
        return <MatchRow {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default MatchList;
