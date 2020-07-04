import { FC } from 'react';
import { useStyletron } from 'baseui';
import { HeadingXLarge } from 'baseui/typography';

import GQL from 'lib/graphql';
import FactionIcon from 'lib/components/faction-icon';

import { FactionMatImg, PlayerMatImg } from '../mat-images';

interface Props {
  faction: Pick<GQL.Faction, 'id' | 'name'>;
  playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
}

const MatComboCompare: FC<Props> = ({ faction, playerMat }) => {
  const [css, theme] = useStyletron();

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',

        alignItems: 'center',

        [theme.mediaQuery.medium]: {
          alignItems: 'stretch',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          margin: '0 0 15px',
        })}
      >
        <FactionIcon
          className={css({
            flex: '0 0 auto',
          })}
          faction={faction.name}
          size={64}
        />
        <HeadingXLarge
          overrides={{
            Block: {
              style: {
                margin: '0 0 0 15px',
              },
            },
          }}
        >
          {faction.name} {playerMat.name}
        </HeadingXLarge>
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 0,

          [theme.mediaQuery.medium]: {
            flexDirection: 'row',
            alignItems: 'center',
          },

          [theme.mediaQuery.large]: {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        })}
      >
        <div
          className={css({
            minWidth: 0,
          })}
        >
          <FactionMatImg
            factionName={faction.name}
            className={css({
              width: '100%',
              minWidth: 0,

              [theme.mediaQuery.medium]: {
                padding: '0 20px 0 0',
              },

              [theme.mediaQuery.large]: {
                width: '500px',
                padding: 0,
              },
            })}
          />
        </div>
        <div
          className={css({
            minWidth: 0,
          })}
        >
          <PlayerMatImg
            playerMatName={playerMat.name}
            className={css({
              width: '100%',
              minWidth: 0,

              [theme.mediaQuery.large]: {
                width: '500px',
              },
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default MatComboCompare;
