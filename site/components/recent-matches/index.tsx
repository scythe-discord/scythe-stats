import { FunctionComponent } from 'react';
import { Heading, HeadingLevel } from 'baseui/heading';
import { Table } from 'baseui/table';

import GQL from '../../lib/graphql';

const INITIAL_MATCH_COUNT = 10;

const findWinningResult = (playerResults: GQL.PlayerMatchResult[]) => {
  let winningResult: GQL.PlayerMatchResult = playerResults[0];

  for (let i = 0; i < playerResults.length; i++) {
    const currResult = playerResults[i];

    if (currResult.coins > winningResult.coins) {
      winningResult = currResult;
    }
  }

  return winningResult;
};

const RecentMatches: FunctionComponent = () => {
  const { data } = GQL.useMatchesQuery({
    variables: {
      first: INITIAL_MATCH_COUNT
    }
  });

  const tableData = data
    ? data.matches.edges.map(({ node }) => {
        const winningResult = findWinningResult(node.playerResults);
        return [
          winningResult.player.displayName,
          winningResult.faction.name,
          winningResult.playerMat.name,
          node.numRounds,
          new Date(node.datePlayed).toLocaleDateString()
        ];
      })
    : [];

  return (
    <HeadingLevel>
      <Heading>Recent Matches</Heading>
      <Table
        columns={['Winner', 'Faction', 'Player Mat', 'Rounds Played', 'Date']}
        data={tableData}
      />
    </HeadingLevel>
  );
};

export default RecentMatches;
