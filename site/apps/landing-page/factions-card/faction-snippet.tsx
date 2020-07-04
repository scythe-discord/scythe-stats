import { FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { H1, LabelMedium } from 'baseui/typography';
import { ListItem, PropsT, ListItemLabel } from 'baseui/list';

import GQL from '../../../lib/graphql';
import { FactionIcon } from '../../../lib/components';

const getBestPlayerMat = (
  combos: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  })[]
) => {
  let bestWinRate = -1;
  let bestPlayerMat = combos[0].playerMat;

  combos.forEach(({ playerMat, totalMatches, totalWins }) => {
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
  faction: Pick<GQL.Faction, 'id' | 'name' | 'totalWins' | 'totalMatches'>;
  topPlayerStats:
    | (Pick<GQL.PlayerFactionStats, 'totalWins'> & {
        player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
      })
    | null;
  factionMatCombos: Array<
    Pick<
      GQL.FactionMatCombo,
      | 'totalWins'
      | 'totalMatches'
      | 'avgCoinsOnWin'
      | 'avgRoundsOnWin'
      | 'leastRoundsForWin'
    > & { playerMat: Pick<GQL.PlayerMat, 'id' | 'name'> }
  >;
  className?: string;
}

const FactionSnippet: FC<Props> = ({
  faction,
  factionMatCombos,
  topPlayerStats,
  className,
}) => {
  const [css, theme] = useStyletron();

  const bestPlayerMat = getBestPlayerMat(factionMatCombos);

  return (
    <div className={className}>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
        })}
      >
        <FactionIcon
          faction={faction.name}
          size={72}
          className={css({
            padding: '0 20px 0 0',
          })}
        />
        <H1
          overrides={{
            Block: {
              style: {
                margin: 0,
              },
            },
          }}
        >
          {faction.name}
        </H1>
      </div>
      <ul
        className={css({
          padding: 0,
          margin: '30px 0 0',
          backgroundColor: theme.colors.backgroundSecondary,
        })}
      >
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>
              {faction.totalMatches} Games
            </SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Games Recorded</ListItemLabel>
        </StyledListItem>
        <StyledListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{faction.totalWins} Wins</SnippetEndEnhancer>
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
            <SnippetEndEnhancer>
              {topPlayerStats
                ? `${topPlayerStats.player.displayName} (${topPlayerStats.totalWins} Wins)`
                : 'No one!'}
            </SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Top Player</ListItemLabel>
        </StyledListItem>
      </ul>
    </div>
  );
};

export default FactionSnippet;
