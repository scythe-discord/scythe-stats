import { FunctionComponent, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';

import GQL from '../../lib/graphql';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';
import Card from '../card';

import MatchDetails from '../match-details';
import RecentMatchBanner from './recent-match-banner';

const INITIAL_MATCH_COUNT = 10;

const RecentMatches: FunctionComponent = () => {
  const [css, theme] = useStyletron();
  const [selected, setSelected] = useState(0);
  const { loading, data } = GQL.useMatchesQuery({
    variables: {
      first: INITIAL_MATCH_COUNT
    }
  });
  const onMatchClick = useCallback(
    (id: string) => {
      if (!data) {
        return;
      }

      const idx = data.matches.edges.findIndex(({ node }) => {
        return node.id === id;
      });
      setSelected(idx);
    },
    [data]
  );

  if (loading || !data) {
    return null;
  }

  const timelineElements: TimelineElement[] = data.matches.edges.map(
    ({ node }) => {
      const { id, datePlayed, numRounds, playerResults } = node;
      let winningResult = playerResults[0];

      for (let i = 0; i < playerResults.length; i++) {
        const currResult = playerResults[i];

        if (currResult.coins > winningResult.coins) {
          winningResult = currResult;
        }
      }

      const {
        faction: { name: factionName },
        playerMat: { name: playerMatName },
        player: { displayName }
      } = winningResult;

      const content = (
        <RecentMatchBanner
          id={id}
          displayName={displayName}
          factionName={factionName}
          playerMatName={playerMatName}
          numRounds={numRounds}
          onClick={onMatchClick}
        />
      );

      return {
        key: id,
        isSelectable: true,
        content,
        date: datePlayed
      };
    }
  );

  const selectedMatch = data.matches.edges[selected].node;

  const matchDetailsRows = selectedMatch.playerResults.map(
    ({
      player: { displayName },
      faction: { name: factionName },
      playerMat: { name: playerMatName },
      coins
    }) => {
      return {
        playerName: displayName,
        faction: factionName,
        playerMat: playerMatName,
        coins
      };
    }
  );

  return (
    <Card>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',

          [theme.mediaQuery.large]: {
            flexDirection: 'column',
            flexWrap: 'nowrap'
          }
        })}
      >
        <VerticalTimeline
          elements={timelineElements}
          selected={selected}
          onClick={onMatchClick}
        />
        <MatchDetails
          className={css({
            margin: '30px 0 0 0'
          })}
          rows={matchDetailsRows}
        />
      </div>
    </Card>
  );
};

export default RecentMatches;
