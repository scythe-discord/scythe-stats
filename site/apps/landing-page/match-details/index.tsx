import { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { useStyletron, withStyle } from 'baseui';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';
import classNames from 'classnames';

import GQL from 'lib/graphql';

import MatchRow from './match-row';

const TIMELINE_WIDTH = 550;

// Intended to style the table such that changes in height
// (more or less players) do not shift container sizes
// Height reflects a max 7 player game
const MIN_MATCH_DETAILS_HEIGHT = 315;

const CenteredHeadCell = withStyle(StyledHeadCell, {
  display: 'flex',
  alignItems: 'center',
});

interface MatchDetailsRow {
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
}

interface Props {
  selectedMatch?: {
    playerMatchResults: Array<
      Pick<GQL.PlayerMatchResult, 'id' | 'coins' | 'tieOrder'> & {
        player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
        faction: Pick<GQL.Faction, 'id' | 'name'>;
        playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
      }
    >;
    winner: Pick<GQL.PlayerMatchResult, 'id'>;
  };
  className?: string;
  isLoading?: boolean;
}

const MatchDetails: FC<Props> = ({ className, selectedMatch, isLoading }) => {
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
      tieOrder,
    }) => {
      return {
        id,
        playerName: displayName,
        faction: factionName,
        playerMat: playerMatName,
        coins,
        tieOrder,
      };
    }
  );

  matchDetailRows.sort((a, b) => {
    if (a.coins < b.coins || (a.coins === b.coins && a.tieOrder > b.tieOrder)) {
      return 1;
    }

    return -1;
  });

  return (
    <StyledTable
      className={classNames(
        css({
          minHeight: `${MIN_MATCH_DETAILS_HEIGHT}px`,
        }),
        className
      )}
      $gridTemplateColumns="auto 150px 150px 75px"
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
