import { FunctionComponent, FC } from 'react';
import { useStyletron } from 'baseui';
import { H1, Label1 } from 'baseui/typography';

import GQL from '../../lib/graphql';

import Card from '../card';
import PlayerTable from './player-table';

const StyledLabel: FC = props => (
  <Label1
    {...props}
    overrides={{
      Block: {
        style: {
          margin: '10px 0'
        }
      }
    }}
  />
);

interface Props {
  topPlayersAllTime: GQL.TopPlayersQuery;
  topPlayersMonthly: GQL.TopPlayersQuery;
}

const TopPlayers: FunctionComponent<Props> = ({
  topPlayersAllTime,
  topPlayersMonthly
}) => {
  const [css] = useStyletron();

  return (
    <Card>
      <H1
        overrides={{
          Block: {
            style: {
              marginTop: 0
            }
          }
        }}
      >
        Top Players
      </H1>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column'
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column'
          })}
        >
          <StyledLabel>of all time</StyledLabel>
          <PlayerTable
            players={topPlayersAllTime.playersByWins.edges.map(({ node }) => ({
              ...node
            }))}
          />
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            margin: '30px 0'
          })}
        >
          <StyledLabel>this past month</StyledLabel>
          <PlayerTable
            players={topPlayersMonthly.playersByWins.edges.map(({ node }) => ({
              ...node
            }))}
          />
        </div>
      </div>
    </Card>
  );
};

export default TopPlayers;
