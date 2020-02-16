import { FunctionComponent, ReactNode, useState } from 'react';
import { withStyle, useStyletron } from 'baseui';
import { StyledTable, StyledHeadCell } from 'baseui/table-grid';
import { format } from 'timeago.js';

import TimelineCircle from './timeline-circle';
import TimelineLine from './timeline-line';

interface TimelineElement {
  key: string;
  selectable: boolean;
  content: ReactNode;
  onClick: (key: string) => void;
}

interface Props {
  elements: TimelineElement[];
  selected: number;
}

const SELECTED_CIRCLE_SIZE = 50;
const UNSELECTED_CIRCLE_SIZE = 30;
const LINE_WIDTH = 3;
const LINE_HEIGHT = 20;

const VerticalTimeline: FunctionComponent<Props> = () => {
  const [css] = useStyletron();
  const [moved, setMoved] = useState(false);

  const timelineSvgCss = css({
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all linear 0.5s'
  });

  const outerSvgCss = css({
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all linear 0.5s',
    opacity: '0'
  });

  const visibleHeight = `${SELECTED_CIRCLE_SIZE +
    UNSELECTED_CIRCLE_SIZE * 2 +
    LINE_HEIGHT * 2 +
    LINE_HEIGHT}px`;

  return (
    <div
      className={css({
        display: 'flex'
      })}
    >
      <div
        className={css({
          position: 'relative',
          overflow: 'hidden',
          width: '50px',
          height: visibleHeight
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            top: moved ? '50px' : 0,
            transition: 'all linear 0.5s'
          })}
        >
          <TimelineCircle
            key="hi"
            isSelected={true}
            size={UNSELECTED_CIRCLE_SIZE}
            className={timelineSvgCss}
          />
          <TimelineLine
            width={LINE_WIDTH}
            height={LINE_HEIGHT}
            className={timelineSvgCss}
          />
          <TimelineCircle
            key="hi"
            isSelected={true}
            size={moved ? SELECTED_CIRCLE_SIZE : UNSELECTED_CIRCLE_SIZE}
            className={timelineSvgCss}
          />
          <TimelineLine
            width={LINE_WIDTH}
            height={LINE_HEIGHT}
            className={timelineSvgCss}
          />
          <TimelineCircle
            key="hi"
            isSelected={true}
            size={moved ? UNSELECTED_CIRCLE_SIZE : SELECTED_CIRCLE_SIZE}
            className={timelineSvgCss}
          />
          <TimelineLine
            width={LINE_WIDTH}
            height={LINE_HEIGHT}
            className={timelineSvgCss}
          />
          <TimelineCircle
            key="hi"
            isSelected={true}
            size={UNSELECTED_CIRCLE_SIZE}
            className={timelineSvgCss}
          />
        </div>
      </div>

      <button onClick={() => setMoved(!moved)}>Move</button>
    </div>
  );
};

export default VerticalTimeline;
