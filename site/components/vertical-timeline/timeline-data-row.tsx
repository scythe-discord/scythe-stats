import { FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';
import { format } from 'timeago.js';

import { DATE_TXT_WIDTH, CIRCLE_SIZE } from './dimensions';
import TimelineCircle from './timeline-circle';

interface Props {
  id: string;
  isSelected: boolean;
  content: ReactNode;
  rawContentDescriptor: string;
  date: string;
  onClick?: (id: string) => void;
}

const TimelineDataRow: FC<Props> = ({
  id,
  isSelected,
  content,
  rawContentDescriptor,
  date,
  onClick
}) => {
  const [css] = useStyletron();

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center'
      })}
    >
      <LabelMedium
        overrides={{
          Block: {
            style: {
              flex: `0 0 auto`,
              width: `${DATE_TXT_WIDTH}px`,
              textAlign: 'right',
              padding: '0 15px 0 0'
            }
          }
        }}
      >
        {format(date)}
      </LabelMedium>
      <div
        className={css({
          display: 'flex',
          flex: `0 0 ${CIRCLE_SIZE}px`,
          justifyContent: 'center',
          padding: '0'
        })}
      >
        <TimelineCircle
          id={id}
          size={CIRCLE_SIZE}
          onClick={onClick}
          isSelected={isSelected}
          rawContentDescriptor={rawContentDescriptor}
        />
      </div>
      <div
        className={css({
          padding: '0 0 0 15px'
        })}
      >
        {content}
      </div>
    </div>
  );
};

export default TimelineDataRow;
