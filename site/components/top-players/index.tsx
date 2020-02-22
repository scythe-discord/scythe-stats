import { FunctionComponent } from 'react';
import { Table } from 'baseui/table';

import GQL from '../../lib/graphql';

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

const TopPlayers: FunctionComponent = () => {
  const { data } = GQL.useTopPlayersQuery({
    variables: {
      first: INITIAL_PLAYER_COUNT
    }
  });

  const tableData = data ? getTableData(data) : [];

  return (
    <Table columns={['Player', 'Total Wins', 'Win Rate']} data={tableData} />
  );
};

export default TopPlayers;
