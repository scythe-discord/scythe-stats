import { FC, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';

import GQL from '../../lib/graphql';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';
import Card from '../card';
import MatchDetails from '../match-details';

import RecentMatchBanner from './recent-match-banner';

interface Props {
  recentMatches: GQL.MatchesQuery;
}

const RecentMatches: FC<Props> = ({ recentMatches }) => {
  const [css, theme] = useStyletron();
  const [selected, setSelected] = useState(0);
  const onMatchClick = useCallback(
    (id: string) => {
      const idx = recentMatches.matches.edges.findIndex(({ node }) => {
        return node.id === id;
      });
      setSelected(idx);
    },
    [recentMatches]
  );

  const timelineElements: TimelineElement[] = recentMatches.matches.edges.map(
    ({ node }, idx) => {
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
          isSelected={idx === selected}
          onClick={onMatchClick}
        />
      );

      const rawContentDescriptor = `${displayName} won as ${factionName} ${playerMatName} in ${numRounds} rounds`;

      return {
        key: id,
        isSelectable: true,
        content,
        rawContentDescriptor,
        date: datePlayed
      };
    }
  );

  const selectedMatch = recentMatches.matches.edges[selected].node;

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
            // Intended to style the table such that changes in height
            // (more or less players) do not shift container sizes
            // Height reflects a max 7 player game
            gridTemplateRows: '45px',
            minHeight: '315px',
            margin: '40px 0 0 0'
          })}
          rows={matchDetailsRows}
        />
      </div>
    </Card>
  );
};

export default RecentMatches;
