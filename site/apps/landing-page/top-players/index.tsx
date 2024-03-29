import { FC } from 'react';
import { useStyletron } from 'baseui';
import { BlockProps } from 'baseui/block';
import { HeadingLarge, LabelLarge } from 'baseui/typography';

import GQL from 'lib/graphql';
import Card from '../card';

import PlayerTable from './player-table';

const StyledLabel: FC<BlockProps> = (props) => (
  <LabelLarge
    {...props}
    overrides={{
      Block: {
        style: {
          margin: '10px 0',
        },
      },
    }}
  />
);

interface Props {
  topPlayersAllTime: GQL.TopPlayersQuery;
  topPlayersMonthly: GQL.TopPlayersQuery;
}

const TopPlayers: FC<Props> = ({ topPlayersAllTime, topPlayersMonthly }) => {
  const [css] = useStyletron();

  return (
    <Card>
      <HeadingLarge
        as="h1"
        overrides={{
          Block: {
            style: {
              marginTop: 0,
            },
          },
        }}
      >
        Top Players
      </HeadingLarge>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <StyledLabel>of all time</StyledLabel>
          <div>
            <PlayerTable
              players={topPlayersAllTime.playersByWins.edges.map(
                ({ node }) => ({
                  ...node,
                })
              )}
            />
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            margin: '30px 0',
          })}
        >
          <StyledLabel>this past month</StyledLabel>
          <div>
            <PlayerTable
              players={topPlayersMonthly.playersByWins.edges.map(
                ({ node }) => ({
                  ...node,
                })
              )}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopPlayers;
