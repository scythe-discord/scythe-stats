import { FunctionComponent, FC } from 'react';
import { useStyletron } from 'baseui';
import { H1, Label1 } from 'baseui/typography';
import moment from 'moment';

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

const TopPlayers: FunctionComponent = () => {
  const [css] = useStyletron();

  return (
    <Card>
      <H1>Top Players</H1>
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
          <PlayerTable />
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
            fromDate={moment()
              .subtract(1, 'month')
              .toISOString()}
          />
        </div>
      </div>
    </Card>
  );
};

export default TopPlayers;
