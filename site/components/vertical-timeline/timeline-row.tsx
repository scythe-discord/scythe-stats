import { FunctionComponent, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';
import { format } from 'timeago.js';

import TimelineCircle from './timeline-circle';
import TimelineLine from './timeline-line';

const DATE_TXT_WIDTH = 125;
const CIRCLE_SIZE = 25;
const LINE_WIDTH = 2;
const LINE_HEIGHT = 50;

interface Props {
  element?: {
    id: string;
    isSelected: boolean;
    content: ReactNode;
    rawContentDescriptor: string;
    date: string;
    onClick?: (id: string) => void;
  };
}

const TimelineRow: FunctionComponent<Props> = ({ element }) => {
  const [css] = useStyletron();

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: element ? 'center' : 'stretch'
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
        {element && format(element.date)}
      </LabelMedium>
      <div
        className={css({
          display: 'flex',
          flex: `0 0 ${CIRCLE_SIZE}px`,
          justifyContent: 'center',
          padding: element ? '0' : '2px 0'
        })}
      >
        {element ? (
          <TimelineCircle
            id={element.id}
            size={CIRCLE_SIZE}
            onClick={element.onClick}
            isSelected={element.isSelected}
            rawContentDescriptor={element.rawContentDescriptor}
          />
        ) : (
          <TimelineLine width={LINE_WIDTH} height={LINE_HEIGHT} />
        )}
      </div>
      {element && (
        <div
          className={css({
            padding: '0 0 0 15px'
          })}
        >
          {element.content}
        </div>
      )}
    </div>
  );
};

export default TimelineRow;
