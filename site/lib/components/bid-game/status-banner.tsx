import { useStyletron } from 'baseui';
import { Banner } from 'baseui/banner';
import { StyledLink } from 'baseui/link';
import { BidGameFragment, BidGameStatus } from 'lib/graphql/codegen';
import React, { useContext } from 'react';
import { AuthContext } from '../auth';

const MAX_PLAYERS = 7;

export default function StatusBanner({
  bidGame,
  onClickStartGame,
  onClickEditGameSettings,
  startGameLoading,
  onClickJoinGame,
  joinGameLoading,
  ownPlayer,
  onCopyLink,
}: {
  bidGame: BidGameFragment;
  onClickEditGameSettings: () => void;
  onClickStartGame: () => void;
  onClickJoinGame: () => void;
  joinGameLoading: boolean;
  startGameLoading: boolean;
  ownPlayer: BidGameFragment['players'][number] | undefined;
  onCopyLink: () => void;
}) {
  const { discordMe } = useContext(AuthContext);
  const [css] = useStyletron();

  let banner: { title: string; text: React.ReactNode } | null = null;

  if (bidGame) {
    if (bidGame.status === BidGameStatus.Created) {
      if (ownPlayer && ownPlayer.id === bidGame.host.id) {
        banner = {
          title: "You're the host!",
          text: (
            <div>
              <StyledLink
                className={css({ cursor: 'pointer' })}
                onClick={() => onClickEditGameSettings()}
              >
                Update
              </StyledLink>{' '}
              the game settings ,{' '}
              <StyledLink
                className={css({ cursor: 'pointer' })}
                onClick={onCopyLink}
              >
                copy
              </StyledLink>{' '}
              and share the link to this game with other players, and once all
              players have joined,{' '}
              <StyledLink
                className={css({ cursor: 'pointer' })}
                onClick={() => {
                  if (startGameLoading) {
                    return;
                  }
                  onClickStartGame();
                }}
              >
                start the game.
              </StyledLink>
            </div>
          ),
        };
      } else if (ownPlayer) {
        banner = {
          title: 'Get ready!',
          text:
            bidGame.players.length === MAX_PLAYERS
              ? `Waiting for ${bidGame.host.user.username} to start...`
              : `Waiting for more players to join or for ${bidGame.host.user.username} to start...`,
        };
      } else if (discordMe) {
        if (bidGame.players.length === MAX_PLAYERS) {
          banner = {
            title: 'Sorry, this bid game is full.',
            text: null,
          };
        } else {
          banner = {
            title: 'Welcome!',
            text: (
              <div>
                <StyledLink
                  className={css({ cursor: 'pointer' })}
                  onClick={() => {
                    if (joinGameLoading) {
                      return;
                    }
                    onClickJoinGame();
                  }}
                >
                  Click here
                </StyledLink>{' '}
                to join this bid game.
              </div>
            ),
          };
        }
      }
    } else if (bidGame.status === BidGameStatus.Bidding) {
      if (bidGame.quickBid) {
        if (ownPlayer?.quickBidReady) {
          banner = {
            title: `Bid confirmed.`,
            text: `Waiting for ${bidGame.players
              .filter((p) => !p.quickBidReady)
              .map((p) => p.user.username)
              .join(', ')} to confirm their bids.`,
          };
        } else {
          banner = {
            title: `Game started!`,
            text: (
              <div>
                Click{' '}
                <StyledLink
                  // i am lazy
                  href="https://discord.com/channels/299026961630494722/299026961630494722/1019659130258079754"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </StyledLink>{' '}
                to learn more about quick bid games.
              </div>
            ),
          };
        }
      } else if (ownPlayer && bidGame.activePlayer?.id === ownPlayer.id) {
        banner = {
          title: `Game started!`,
          text: `It's your turn! Which faction/player mat do you want to bid on?`,
        };
      } else {
        banner = {
          title: `Game started!`,
          text: `Current player: ${bidGame.activePlayer?.user.username}`,
        };
      }
    } else if (bidGame.status === BidGameStatus.BiddingFinished) {
      banner = {
        title: 'Bidding complete.',
        text: "Don't forget to record your match results!",
      };
    } else if (bidGame.status === BidGameStatus.GameRecorded) {
      banner = {
        title: 'Game complete and recorded.',
        text: null,
      };
    } else if (bidGame.status === BidGameStatus.Expired) {
      banner = {
        title: 'This game has expired.',
        text: 'A player in this game has recorded another bid game. In order to preserve the integrity of rankings, the results of this game can no longer be recorded.',
      };
    }
  }

  return (
    banner && (
      <Banner
        overrides={{ Root: { style: () => ({ margin: '30px 0px' }) } }}
        title={banner.title}
      >
        {banner.text}
      </Banner>
    )
  );
}
