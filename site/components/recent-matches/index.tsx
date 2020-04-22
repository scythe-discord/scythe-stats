import { FC, useState, useCallback } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { HeadingLarge, LabelSmall } from 'baseui/typography';
import { StyledLink } from 'baseui/link';
import { StyledSpinnerNext } from 'baseui/spinner';

import GQL from '../../lib/graphql';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';
import Card from '../card';
import MatchDetails from '../match-details';

import RecentMatchBanner from './recent-match-banner';

const TIMELINE_WIDTH = '550px';
const TIMELINE_HEIGHT = '450px';

const DiscordLink = withStyle(StyledLink as any, {
  // Some attempt at mimicking Discord blurple
  color: '#304eb6',
  textDecoration: 'none',
  ':visited': {
    color: '#304eb6'
  },
  ':hover': {
    color: '#8da0e1'
  },
  ':active, :focus': {
    color: '#8da0e1'
  }
});

const RecentMatches: FC = () => {
  const [css, theme] = useStyletron();
  const [selected, setSelected] = useState(0);
  const { data: recentMatches, loading, fetchMore } = GQL.useMatchesQuery({
    query: GQL.MatchesDocument,
    variables: {
      first: 10
    }
  });

  const onMatchClick = useCallback(
    (id: string) => {
      if (!recentMatches) {
        return;
      }

      const idx = recentMatches.matches.edges.findIndex(({ node }) => {
        return node.id === id;
      });
      setSelected(idx);
    },
    [recentMatches]
  );

  const onLoadMore = useCallback(
    (page: number) => {
      if (!recentMatches || page === 0) {
        return;
      }

      const {
        matches: {
          pageInfo: { hasNextPage, endCursor }
        }
      } = recentMatches;

      if (!hasNextPage || !endCursor) {
        return;
      }

      fetchMore({
        variables: {
          after: endCursor
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            ...prev,
            matches: {
              ...prev.matches,
              edges: [...prev.matches.edges, ...fetchMoreResult.matches.edges],
              pageInfo: {
                ...prev.matches.pageInfo,
                hasNextPage: fetchMoreResult.matches.pageInfo.hasNextPage,
                endCursor: fetchMoreResult.matches.pageInfo.endCursor
              }
            }
          };
        }
      });
    },
    [recentMatches]
  );

  let content = null;

  if (loading && !recentMatches) {
    content = (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: TIMELINE_HEIGHT,

          [theme.mediaQuery.large]: {
            width: TIMELINE_WIDTH
          }
        })}
      >
        <StyledSpinnerNext />
      </div>
    );
  } else if (!recentMatches) {
    content = (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: TIMELINE_WIDTH,
          height: TIMELINE_HEIGHT,

          [theme.mediaQuery.large]: {
            width: TIMELINE_WIDTH
          }
        })}
      >
        We failed to load recent matches :(
      </div>
    );
  } else {
    const timelineElements: TimelineElement[] = recentMatches.matches.edges.map(
      ({ node }, idx) => {
        const { id, datePlayed, numRounds, playerResults, winner } = node;
        // Although hypothetically this never fails to find a winner
        const winningResult =
          playerResults.find(({ id }) => id === winner.id) || playerResults[0];

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

    content = (
      <>
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
            width={TIMELINE_WIDTH}
            maxHeight={TIMELINE_HEIGHT}
            loadMore={onLoadMore}
            hasMore={recentMatches.matches.pageInfo.hasNextPage}
          />
          <MatchDetails
            className={css({
              // Intended to style the table such that changes in height
              // (more or less players) do not shift container sizes
              // Height reflects a max 7 player game
              gridTemplateRows: '45px',
              minHeight: '315px',
              margin: '40px 0 0'
            })}
            rows={matchDetailsRows}
          />
        </div>
        <LabelSmall
          overrides={{
            Block: {
              style: {
                textAlign: 'center',
                margin: '25px 0 0',

                [theme.mediaQuery.large]: {
                  textAlign: 'left'
                }
              }
            }
          }}
        >
          Looking for more matches?{' '}
          <DiscordLink
            href="https://discord.gg/dcRcxy2"
            target="_blank"
            rel="noopener"
          >
            Join our Discord!
          </DiscordLink>
        </LabelSmall>
      </>
    );
  }

  return (
    <Card>
      <HeadingLarge
        as="h1"
        overrides={{
          Block: {
            style: {
              marginTop: 0
            }
          }
        }}
      >
        Recent Matches
      </HeadingLarge>
      {content}
    </Card>
  );
};

export default RecentMatches;
