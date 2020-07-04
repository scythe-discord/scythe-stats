import { FC, useState, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { LabelSmall } from 'baseui/typography';

import GQL from '../../../lib/graphql';
import Card from '../card';
import MatchDetails from '../match-details';
import DiscordLink from '../discord-link';

import RecentMatchesHeader from './recent-matches-header';
import RecentMatchesTimeline from './recent-matches-timeline';

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
  const { data: recentMatches, loading, fetchMore } = GQL.useMatchesQuery({
    query: GQL.MatchesDocument,
    variables: {
      first: 10,
    },
    notifyOnNetworkStatusChange: true,
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

  const selectedMatch =
    recentMatches && recentMatches.matches.edges.length
      ? recentMatches.matches.edges[selected].node
      : undefined;
  let hasMore = false;

  if (recentMatches) {
    const currEndCursor = recentMatches.matches.pageInfo.endCursor;
    hasMore =
      currEndCursor !== lastFetchedCursor &&
      !!recentMatches.matches.pageInfo.hasNextPage;
  }

  return (
    <Card>
      <RecentMatchesHeader
        factionStats={factionStats}
        playerMats={playerMats}
      />
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
        <RecentMatchesTimeline
          recentMatches={recentMatches}
          hasMore={hasMore}
          isLoading={loading}
          onLoadMore={onLoadMore}
          onMatchClick={onMatchClick}
          selected={selected}
        />
        <MatchDetails
          className={css({
            gridTemplateRows: '45px',
            margin: '40px 0 0',
          })}
          selectedMatch={selectedMatch}
          isLoading={!recentMatches}
        />
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
    </Card>
  );
};

export default RecentMatches;
