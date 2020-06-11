import { FC } from 'react';

import GQL from '../../lib/graphql';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';

import RecentMatchBanner from './recent-match-banner';

const INIT_NUM_LOADING_ELEMENTS = 5; // i.e. for the initial load
const DEFAULT_NUM_LOADING_ELEMENTS = 3;

const TIMELINE_WIDTH = 550;
const TIMELINE_HEIGHT = 450;

interface Props {
  recentMatches?: GQL.MatchesQuery;
  isLoading: boolean;
  hasMore: boolean;
  onMatchClick: (id: string) => void;
  onLoadMore: (page: number) => void;
  selected: number;
}

const RecentMatches: FC<Props> = ({
  recentMatches,
  onMatchClick,
  onLoadMore,
  isLoading,
  hasMore,
  selected,
}) => {
  let timelineElements: TimelineElement[] = [];

  if (recentMatches) {
    timelineElements = recentMatches.matches.edges.map(({ node }, idx) => {
      const { id, datePlayed, numRounds, playerMatchResults, winner } = node;
      // Although hypothetically this never fails to find a winner
      const winningResult =
        playerMatchResults.find(({ id }) => id === winner.id) ||
        playerMatchResults[0];

      const {
        faction: { name: factionName },
        playerMat: { name: playerMatName },
        player: { displayName },
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
        date: datePlayed,
      };
    });
  }

  return (
    <VerticalTimeline
      elements={timelineElements}
      selected={selected}
      onClick={onMatchClick}
      width={`${TIMELINE_WIDTH}px`}
      maxHeight={`${TIMELINE_HEIGHT}px`}
      loadMore={onLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      numLoadingElements={
        timelineElements.length
          ? DEFAULT_NUM_LOADING_ELEMENTS
          : INIT_NUM_LOADING_ELEMENTS
      }
    />
  );
};

export default RecentMatches;
