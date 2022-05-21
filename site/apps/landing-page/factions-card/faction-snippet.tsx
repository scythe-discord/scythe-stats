import { FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { Spinner, SIZE } from 'baseui/spinner';
import { LabelMedium } from 'baseui/typography';
import { ListItem, PropsT, ListItemLabel } from 'baseui/list';

import GQL from 'lib/graphql';

const getBestPlayerMat = (
  combos: Array<
    { playerMat: Pick<GQL.PlayerMat, 'id' | 'name'> } & {
      statsByPlayerCount: Array<
        Pick<
          GQL.FactionMatComboStatsWithPlayerCount,
          | 'playerCount'
          | 'totalWins'
          | 'totalMatches'
          | 'avgCoinsOnWin'
          | 'avgRoundsOnWin'
          | 'leastRoundsForWin'
        >
      >;
    }
  >,
  selectedPlayerCounts: Set<number>
) => {
  let bestWinRate = -1;
  let bestPlayerMat = combos[0].playerMat;

  combos.forEach(({ playerMat, statsByPlayerCount }) => {
    const relevantStats = statsByPlayerCount.filter(({ playerCount }) =>
      selectedPlayerCounts.has(playerCount)
    );

    const totalWins = relevantStats.reduce(
      (prevValue, currValue) => prevValue + currValue.totalWins,
      0
    );
    const totalMatches = relevantStats.reduce(
      (prevValue, currValue) => prevValue + currValue.totalMatches,
      0
    );

    const winRate = (100 * totalWins) / totalMatches;
    if (winRate > bestWinRate) {
      bestWinRate = winRate;
      bestPlayerMat = playerMat;
    }
  });

  return bestPlayerMat;
};

const SnippetEndEnhancer: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <LabelMedium
      overrides={{
        Block: {
          style: {
            padding: '0 0 0 30px',
          },
        },
      }}
    >
      {children}
    </LabelMedium>
  );
};

const StyledListItem: FC<PropsT> = (props) => {
  const [_, theme] = useStyletron();

  return (
    <ListItem
      overrides={{
        Content: {},
        Root: {
          style: {
            backgroundColor: theme.colors.backgroundSecondary,
          },
        },
        ArtworkContainer: {},
        EndEnhancerContainer: {},
      }}
      {...props}
    />
  );
};

interface Props {
  faction: Pick<GQL.Faction, 'id' | 'name'> & {
    statsByPlayerCount: Array<
      Pick<
        GQL.FactionStatsWithPlayerCount,
        'playerCount' | 'totalWins' | 'totalMatches'
      >
    >;
  };
  topPlayerStats:
    | (Pick<GQL.PlayerFactionStats, 'totalWins'> & {
        player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
      })
    | null;
  topPlayerStatsLoading: boolean;
  factionMatCombos: Array<
    { playerMat: Pick<GQL.PlayerMat, 'id' | 'name'> } & {
      statsByPlayerCount: Array<
        Pick<
          GQL.FactionMatComboStatsWithPlayerCount,
          | 'playerCount'
          | 'totalWins'
          | 'totalMatches'
          | 'avgCoinsOnWin'
          | 'avgRoundsOnWin'
          | 'leastRoundsForWin'
        >
      >;
    }
  >;
  selectedPlayerCounts: Set<number>;
  className?: string;
}

const FactionSnippet: FC<Props> = ({
  faction,
  factionMatCombos,
  topPlayerStats,
  topPlayerStatsLoading,
  selectedPlayerCounts,
  className,
}) => {
  const [css, theme] = useStyletron();

  const bestPlayerMat = getBestPlayerMat(
    factionMatCombos,
    selectedPlayerCounts
  );

  const relevantStats = faction.statsByPlayerCount.filter(({ playerCount }) =>
    selectedPlayerCounts.has(playerCount)
  );
  const totalWins = relevantStats.reduce(
    (prevVal, currVal) => prevVal + currVal.totalWins,
    0
  );
  const totalMatches = relevantStats.reduce(
    (prevVal, currVal) => prevVal + currVal.totalMatches,
    0
  );

  let topPlayerLabel: JSX.Element | string = <Spinner size={SIZE.small} />;

  if (!topPlayerStatsLoading && topPlayerStats) {
    topPlayerLabel = `${topPlayerStats.player.displayName} (${topPlayerStats.totalWins} Wins)`;
  } else if (!topPlayerStatsLoading) {
    topPlayerLabel = 'No one!';
  }

  return (
    <div className={className}>
      <ul
        className={css({
          padding: 0,
          backgroundColor: theme.colors.backgroundSecondary,
        })}
      >
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{totalMatches} Games</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Games Recorded</ListItemLabel>
        </StyledListItem>
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{totalWins} Wins</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Total Wins</ListItemLabel>
        </StyledListItem>
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{bestPlayerMat.name}</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Best Player Mat</ListItemLabel>
        </StyledListItem>
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{topPlayerLabel}</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Top Player</ListItemLabel>
        </StyledListItem>
      </ul>
    </div>
  );
};

export default FactionSnippet;
