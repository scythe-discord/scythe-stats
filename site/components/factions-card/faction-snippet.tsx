import { FunctionComponent } from 'react';
import { useStyletron, styled } from 'baseui';
import { H1 } from 'baseui/typography';
import { ListItem, ListItemLabel } from 'baseui/list';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

interface Props {
  factionStats: GQL.FactionStatsQuery;
  className?: string;
}

const SnippetEndEnhancer = styled('span', {
  padding: '0 0 0 30px'
});

const FactionSnippet: FunctionComponent<Props> = ({
  factionStats: { faction, playersByWins },
  className
}) => {
  const [css] = useStyletron();

  const topPlayer = playersByWins.edges[0].node;

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
          margin: '50px 0'
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
