import { useStyletron } from 'baseui';
import { ListHeading, ListItem, ListItemLabel } from 'baseui/list';
import { BidGameFragment } from 'lib/graphql/codegen';
import React from 'react';

export default function PlayerList({
  players,
  hostPlayerId,
  ownPlayer,
}: {
  players: BidGameFragment['players'];
  hostPlayerId: number;
  ownPlayer: BidGameFragment['players'][number] | undefined;
}) {
  const [css] = useStyletron();

  return (
    <ul
      className={css({
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
      })}
    >
      <ListHeading
        heading="Players"
        maxLines={1}
        overrides={{
          Content: {
            style: () => ({
              margin: '0px',
            }),
          },
        }}
      />
      {players.map((player) => (
        <ListItem
          key={player.id}
          overrides={{
            Content: {
              style: () => ({
                margin: '0px',
              }),
            },
          }}
        >
          <ListItemLabel
            description={player.id === hostPlayerId ? 'Host' : undefined}
            overrides={{
              LabelContent: {
                style: () => ({
                  fontWeight:
                    ownPlayer && ownPlayer.id === player.id ? 'bold' : 'normal',
                }),
              },
            }}
          >
            {player.user.username}
          </ListItemLabel>
        </ListItem>
      ))}
    </ul>
  );
}
