import { FunctionComponent } from 'react';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';

import GQL from '../../lib/graphql';
import PlayerRow from './player-row';

const INITIAL_PLAYER_COUNT = 5;

const getTableData = (data: GQL.TopPlayersQuery) => {
  return data.playersByWins.edges.map(
    ({ node: { displayName, totalWins, totalMatches } }) => {
      return {
        displayName,
        totalWins,
        totalMatches
      };
    }
  );
};

interface Props {
  fromDate?: string;
  className?: string;
}

const PlayerTable: FunctionComponent<Props> = ({ fromDate, className }) => {
  const { data } = GQL.useTopPlayersQuery({
    variables: {
      first: INITIAL_PLAYER_COUNT,
      fromDate
    }
  });

  const rows = data ? getTableData(data) : [];

  return (
    <StyledTable className={className} $gridTemplateColumns="auto auto auto">
      <StyledHeadCell>Player</StyledHeadCell>
      <StyledHeadCell>Total Wins</StyledHeadCell>
      <StyledHeadCell>Win Rate</StyledHeadCell>
      {rows.map((row, index) => {
        const striped = index % 2 === 0;
        return <PlayerRow {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default PlayerTable;
