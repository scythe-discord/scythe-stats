import { FunctionComponent, useState } from 'react';
import { useStyletron } from 'baseui';

import GQL from '../../lib/graphql';
import { getFactionEmblem } from '../../lib/scythe';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';

const INITIAL_MATCH_COUNT = 5;

const RecentMatches: FunctionComponent = () => {
  const [css] = useStyletron();
  const [selected, setSelected] = useState(0);
  const { loading, data } = GQL.useMatchesQuery({
    variables: {
      first: INITIAL_MATCH_COUNT
    }
  });

  if (loading || !data) {
    return null;
  }

  const timelineElements: TimelineElement[] = data.matches.edges.map(
    ({ cursor, node }) => {
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
        player: { displayName: playerName }
      } = winningResult;

      const factionEmblemSrc = getFactionEmblem(factionName);

      const content = (
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            border: '1px solid black',
            padding: '5px 10px'
          })}
        >
          <span>{playerName} won as</span>
          <img
            src={factionEmblemSrc}
            className={css({
              margin: '0 5px',
              width: '28px'
            })}
          />
          <span>
            {playerMatName} in {numRounds} rounds
          </span>
        </div>
      );

      return {
        key: id,
        isSelectable: true,
        content,
        date: datePlayed
      };
    }
  );

  return (
    <div
      className={css({
        display: 'flex',
        position: 'relative'
      })}
    >
      <VerticalTimeline
        elements={timelineElements}
        selected={selected}
        className={css({
          position: 'relative',
          left: '-125px'
        })}
      />
    </div>
  );
};

export default RecentMatches;
