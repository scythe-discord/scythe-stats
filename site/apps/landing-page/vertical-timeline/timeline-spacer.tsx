import { FC } from 'react';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';

import {
  DATE_TXT_WIDTH,
  CIRCLE_SIZE,
  LINE_WIDTH,
  LINE_HEIGHT,
} from './dimensions';
import TimelineLine from './timeline-line';

const TimelineSpacer: FC = () => {
  const [css] = useStyletron();

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'stretch',
      })}
    >
      <LabelMedium
        overrides={{
          Block: {
            style: {
              flex: `0 0 auto`,
              width: `${DATE_TXT_WIDTH}px`,
              textAlign: 'right',
              padding: '0 15px 0 0',
            },
          },
        }}
      />
      <div
        className={css({
          display: 'flex',
          flex: `0 0 ${CIRCLE_SIZE}px`,
          justifyContent: 'center',
          padding: '2px 0',
        })}
      >
        <TimelineLine width={LINE_WIDTH} height={LINE_HEIGHT} />
      </div>
    </div>
  );
};

export default TimelineSpacer;
