import { FunctionComponent, FC } from 'react';
import { useStyletron } from 'baseui';
import { Card } from 'baseui/card';
import { Label1 } from 'baseui/typography';
import moment from 'moment';

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
    <Card
      overrides={{
        Root: {
          style: {
            padding: '15px 25px'
          }
        }
      }}
    >
      <div
        className={css({
          display: 'flex'
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
            marginLeft: '75px'
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
