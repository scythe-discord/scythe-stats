import { FC, useState, useCallback, useContext } from 'react';
import ContentLoader from 'react-content-loader';
import { useStyletron, withStyle } from 'baseui';
import { Button, KIND, SIZE } from 'baseui/button';
import { HeadingLarge, LabelSmall } from 'baseui/typography';
import { StyledLink } from 'baseui/link';

import GQL from '../../lib/graphql';
import { AuthContext, DISCORD_OAUTH_URL } from '../../lib/auth';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';
import Card from '../card';
import { MatchDetails, MatchDetailsRow } from '../match-details';

import RecentMatchBanner from './recent-match-banner';
import RecordMatchModal from './record-match-modal';

const INIT_NUM_LOADING_ELEMENTS = 5; // i.e. for the initial load
const DEFAULT_NUM_LOADING_ELEMENTS = 3;

const TIMELINE_WIDTH = 550;
const TIMELINE_HEIGHT = 450;

// Intended to style the table such that changes in height
// (more or less players) do not shift container sizes
// Height reflects a max 7 player game
const MIN_MATCH_DETAILS_HEIGHT = 315;

const DiscordLink = withStyle(StyledLink as any, () => ({
  // Some attempt at mimicking Discord blurple
  color: '#8da0e1',
  textDecoration: 'none',
  ':visited': {
    color: '#8da0e1',
  },
  ':hover': {
    color: '#a8b6e8',
  },
  ':active, :focus': {
    color: '#a8b6e8',
  },
}));

interface Props {
  factionStats: GQL.FactionStatsQuery;
  playerMats: GQL.PlayerMatsQuery;
}

const RecentMatches: FC<Props> = ({ factionStats, playerMats }) => {
  const [css, theme] = useStyletron();
  const [selected, setSelected] = useState(0);
  const [lastFetchedCursor, setLastFetchedCursor] = useState<string | null>(
    null
  );
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);
  const { data: recentMatches, loading, fetchMore } = GQL.useMatchesQuery({
    query: GQL.MatchesDocument,
    variables: {
      first: 10,
    },
    notifyOnNetworkStatusChange: true,
  });

  const onClickRecordMatch = useCallback(
    () => setIsRecordModalVisible(true),
    []
  );
  const onCancelRecordMatch = useCallback(
    () => setIsRecordModalVisible(false),
    []
  );

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
          pageInfo: { hasNextPage, endCursor },
        },
      } = recentMatches;

      if (!hasNextPage || !endCursor) {
        return;
      }

      setLastFetchedCursor(endCursor);

      fetchMore({
        variables: {
          after: endCursor,
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
                endCursor: fetchMoreResult.matches.pageInfo.endCursor,
              },
            },
          };
        },
      });
    },
    [recentMatches]
  );

  let timelineElements: TimelineElement[] = [];
  let matchDetailsRows: MatchDetailsRow[] = [];
  let hasMore = false;

  if (recentMatches) {
    const currEndCursor = recentMatches.matches.pageInfo.endCursor;
    hasMore =
      currEndCursor !== lastFetchedCursor &&
      !!recentMatches.matches.pageInfo.hasNextPage;

    const selectedMatch = recentMatches.matches.edges[selected].node;

    timelineElements = recentMatches.matches.edges.map(({ node }, idx) => {
      const { id, datePlayed, numRounds, playerResults, winner } = node;
      // Although hypothetically this never fails to find a winner
      const winningResult =
        playerResults.find(({ id }) => id === winner.id) || playerResults[0];

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

    matchDetailsRows = selectedMatch.playerResults.map(
      ({
        player: { displayName },
        faction: { name: factionName },
        playerMat: { name: playerMatName },
        coins,
      }) => {
        return {
          playerName: displayName,
          faction: factionName,
          playerMat: playerMatName,
          coins,
        };
      }
    );
  }

  let recordMatchButton = null;
  if (isAuthLoading) {
    recordMatchButton = (
      <Button kind={KIND.secondary} size={SIZE.compact} isLoading={true} />
    );
  } else if (!discordMe) {
    recordMatchButton = (
      <Button
        $as="a"
        href={DISCORD_OAUTH_URL}
        kind={KIND.secondary}
        size={SIZE.compact}
      >
        Login to Record Matches
      </Button>
    );
  } else {
    recordMatchButton = (
      <Button
        kind={KIND.secondary}
        size={SIZE.compact}
        onClick={onClickRecordMatch}
      >
        Record a Match
      </Button>
    );
  }

  return (
    <Card>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          margin: '0 0 20px',
        })}
      >
        <HeadingLarge
          as="h1"
          overrides={{
            Block: {
              style: {
                flex: '1 1 auto',
                margin: 0,
              },
            },
          }}
        >
          Recent Matches
        </HeadingLarge>
        {recordMatchButton}
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',

          [theme.mediaQuery.large]: {
            flexDirection: 'column',
            flexWrap: 'nowrap',
          },
        })}
      >
        <VerticalTimeline
          elements={timelineElements}
          selected={selected}
          onClick={onMatchClick}
          width={`${TIMELINE_WIDTH}px`}
          maxHeight={`${TIMELINE_HEIGHT}px`}
          loadMore={onLoadMore}
          hasMore={hasMore}
          isLoading={loading}
          numLoadingElements={
            timelineElements.length
              ? DEFAULT_NUM_LOADING_ELEMENTS
              : INIT_NUM_LOADING_ELEMENTS
          }
        />
        {recentMatches ? (
          <MatchDetails
            className={css({
              gridTemplateRows: '45px',
              minHeight: `${MIN_MATCH_DETAILS_HEIGHT}px`,
              margin: '40px 0 0',
            })}
            rows={matchDetailsRows}
          />
        ) : (
          <ContentLoader
            className={css({
              margin: '40px 0 0',
            })}
            speed={2}
            width={`${TIMELINE_WIDTH}px`}
            height={`${MIN_MATCH_DETAILS_HEIGHT}px`}
            viewBox={`0 0 ${TIMELINE_WIDTH} ${MIN_MATCH_DETAILS_HEIGHT}`}
            backgroundColor={theme.colors.primary100}
            foregroundColor={theme.colors.primary200}
            uniqueKey="match-details"
          >
            <rect
              x="0"
              y="0"
              rx="3"
              ry="3"
              width={`${TIMELINE_WIDTH}px`}
              height={MIN_MATCH_DETAILS_HEIGHT}
            />
          </ContentLoader>
        )}
      </div>
      <LabelSmall
        overrides={{
          Block: {
            style: {
              textAlign: 'center',
              margin: '25px 0 0',

              [theme.mediaQuery.large]: {
                textAlign: 'left',
              },
            },
          },
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
      <RecordMatchModal
        factions={factionStats.factions}
        playerMats={playerMats.playerMats}
        isOpen={isRecordModalVisible}
        onClose={onCancelRecordMatch}
      ></RecordMatchModal>
    </Card>
  );
};

export default RecentMatches;
