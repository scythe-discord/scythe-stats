import { FunctionComponent, ReactNode } from 'react';
import { useStyletron, styled, withStyle } from 'baseui';
import { H1, LabelMedium } from 'baseui/typography';
import { ListItem, ListItemLabel } from 'baseui/list';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

interface Props {
  factionStats: GQL.FactionStatsQuery;
  className?: string;
}

const getBestPlayerMat = (
  combos: Pick<
    GQL.FactionMatCombo,
    'playerMat' | 'totalWins' | 'totalMatches'
  >[]
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

const SnippetEndEnhancer: FunctionComponent<{ children: ReactNode }> = ({
  children
}) => {
  return (
    <LabelMedium
      overrides={{
        Block: {
          style: {
            padding: '0 0 0 30px'
          }
        }
      }}
    >
      {children}
    </LabelMedium>
  );
};

const FactionSnippet: FunctionComponent<Props> = ({
  factionStats: { faction, factionMatCombos, playersByWins },
  className
}) => {
  const [css] = useStyletron();

  const topPlayer = playersByWins.edges[0].node;
  const bestPlayerMat = getBestPlayerMat(factionMatCombos);

  return (
    <div className={className}>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center'
        })}
      >
        <FactionIcon
          faction={faction.name}
          size={72}
          className={css({
            padding: '0 20px 0 0'
          })}
        />
        <H1
          overrides={{
            Block: {
              style: {
                margin: 0
              }
            }
          }}
        >
          {faction.name}
        </H1>
      </div>
      <ul
        className={css({
          padding: 0,
          margin: '30px 0 0'
        })}
      >
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>
              {faction.totalMatches} Games
            </SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Games Recorded</ListItemLabel>
        </ListItem>
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{faction.totalWins} Wins</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Total Wins</ListItemLabel>
        </ListItem>
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{bestPlayerMat.name}</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Best Player Mat</ListItemLabel>
        </ListItem>
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>
              {topPlayer.displayName} ({topPlayer.totalWins} Wins)
            </SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Top Player</ListItemLabel>
        </ListItem>
      </ul>
    </div>
  );
};

export default FactionSnippet;
