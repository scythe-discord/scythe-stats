import { FunctionComponent } from 'react';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';
import { format } from 'timeago.js';

import GQL from '../../lib/graphql';

import MatchRow from './match-row';

const INITIAL_MATCH_COUNT = 5;

const getTableData = (data: GQL.MatchesQuery) => {
  return data.matches.edges.map(({ node }) => {
    let winningResult = node.playerResults[0];

    for (let i = 0; i < node.playerResults.length; i++) {
      const currResult = node.playerResults[i];

      if (currResult.coins > winningResult.coins) {
        winningResult = currResult;
      }
    }

    const {
      faction: { name: factionName },
      playerMat: { name: playerMatName },
      player: { displayName: playerName }
    } = winningResult;

    return {
      factionName,
      playerMatName,
      playerName,
      numRounds: node.numRounds,
      datePlayed: format(node.datePlayed)
    };
  });
};

const MatchList: FunctionComponent = () => {
  const { data } = GQL.useMatchesQuery({
    variables: {
      first: INITIAL_MATCH_COUNT
    }
  });

  const tableData = data ? getTableData(data) : [];

  return (
    <StyledTable $gridTemplateColumns="auto auto auto max-content auto">
      <StyledHeadCell>Winner</StyledHeadCell>
      <StyledHeadCell>Faction</StyledHeadCell>
      <StyledHeadCell>Player Mat</StyledHeadCell>
      <StyledHeadCell>Rounds</StyledHeadCell>
      <StyledHeadCell>Date</StyledHeadCell>
      {tableData.map((row, index) => {
        const striped = index % 2 === 0;
        return <MatchRow {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default MatchList;
