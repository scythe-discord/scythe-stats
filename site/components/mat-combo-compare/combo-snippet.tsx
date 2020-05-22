import { FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';
import { ListItem, ListItemLabel } from 'baseui/list';

import GQL from '../../lib/graphql';

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

interface Props {
  combo: Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
    topPlayers: Array<
      Pick<GQL.PlayerFactionStats, 'totalWins'> & {
        player: Pick<GQL.Player, 'id' | 'displayName' | 'steamId'>;
      }
    >;
  };
  tier: Pick<GQL.Tier, 'id' | 'name' | 'rank'>;
  className?: string;
}

const ComboSnippet: FC<Props> = ({ combo, tier, className }) => {
  const [css, theme] = useStyletron();

  const topPlayer = combo.topPlayers.length ? combo.topPlayers[0] : null;

  return (
    <div className={className}>
      <ul
        className={css({
          padding: 0,
          margin: 0,
          backgroundColor: theme.colors.backgroundSecondary,
        })}
      >
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{tier.name}</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Tier</ListItemLabel>
        </ListItem>
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{combo.totalMatches} Games</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Games Recorded</ListItemLabel>
        </ListItem>
        <ListItem
          endEnhancer={() => (
            <SnippetEndEnhancer>{combo.totalWins} Wins</SnippetEndEnhancer>
          )}
        >
          <ListItemLabel>Total Wins</ListItemLabel>
        </ListItem>
        {topPlayer && (
          <ListItem
            endEnhancer={() => (
              <SnippetEndEnhancer>
                {topPlayer.player.displayName} ({topPlayer.totalWins} Wins)
              </SnippetEndEnhancer>
            )}
          >
            <ListItemLabel>Top Player</ListItemLabel>
          </ListItem>
        )}
      </ul>
    </div>
  );
};

export default ComboSnippet;
