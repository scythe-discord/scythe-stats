import { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { useStyletron, withStyle } from 'baseui';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';
import classNames from 'classnames';

import MatchRow from './match-row';
import { MatchesQuery } from 'lib/graphql/codegen';

const TIMELINE_WIDTH = 550;

// Intended to style the table such that changes in height
// (more or less players) do not shift container sizes
// Height reflects a max 7 player game
const MIN_MATCH_DETAILS_HEIGHT = 315;

const CenteredHeadCell = withStyle<typeof StyledHeadCell>(StyledHeadCell, {
  display: 'flex',
  alignItems: 'center',
});

interface Props {
  selectedMatch?: Pick<
    MatchesQuery['matches']['edges'][number]['node'],
    'playerMatchResults'
  >;
  className?: string;
  isLoading?: boolean;
  bidGamePage: boolean;
}

const MatchDetails: FC<Props> = ({
  className,
  selectedMatch,
  isLoading,
  bidGamePage,
}) => {
  const [css, theme] = useStyletron();
  if (isLoading || !selectedMatch) {
    return (
      <ContentLoader
        className={css({
          margin: '40px 0 0',
        })}
        speed={2}
        width={`${TIMELINE_WIDTH}px`}
        height={`${MIN_MATCH_DETAILS_HEIGHT}px`}
        viewBox={`0 0 ${TIMELINE_WIDTH} ${MIN_MATCH_DETAILS_HEIGHT}`}
        backgroundColor={theme.colors.primary700}
        foregroundColor={theme.colors.primary600}
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
    );
  }

  const matchDetailRows = selectedMatch.playerMatchResults.map(
    ({
      id,
      player: { displayName },
      faction: { name: factionName },
      playerMat: { name: playerMatName },
      coins,
      rank,
      bidGamePlayer,
    }) => {
      const bidCoins = bidGamePlayer?.bid ? bidGamePlayer.bid.coins : undefined;

      return {
        id,
        playerName: displayName,
        faction: factionName,
        playerMat: playerMatName,
        coins,
        rank,
        bidCoins,
      };
    }
  );

  matchDetailRows.sort((a, b) => a.rank - b.rank);

  return (
    <StyledTable
      className={classNames(
        bidGamePage
          ? css({ gridAutoRows: '50px' })
          : css({
              minHeight: `${MIN_MATCH_DETAILS_HEIGHT}px`,
            }),
        className
      )}
      $gridTemplateColumns="auto 150px 150px 115px"
    >
      <CenteredHeadCell>Player</CenteredHeadCell>
      <CenteredHeadCell>Faction</CenteredHeadCell>
      <CenteredHeadCell>Player Mat</CenteredHeadCell>
      <CenteredHeadCell>Coins</CenteredHeadCell>
      {matchDetailRows.map((row, index) => {
        const striped = index % 2 !== 0;
        return <MatchRow key={index} {...row} striped={striped} />;
      })}
    </StyledTable>
  );
};

export default MatchDetails;
