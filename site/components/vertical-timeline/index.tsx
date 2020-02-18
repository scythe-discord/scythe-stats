import { Fragment, FunctionComponent, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

import TimelineRow from './timeline-row';
import TimelineLine from './timeline-line';

export interface TimelineElement {
  key: string;
  isSelectable: boolean;
  content: ReactNode;
  date: string;
}

interface Props {
  elements: TimelineElement[];
  selected: number;
  className?: string;
  onClick?: (key: string) => void;
}

const CIRCLE_SIZE = 35;
const LINE_WIDTH = 3;
const LINE_HEIGHT = 50;

const VISIBLE_HEIGHT = `${CIRCLE_SIZE * 3 + LINE_HEIGHT * 2 + LINE_HEIGHT}px`;

export const VerticalTimeline: FunctionComponent<Props> = ({
  elements,
  selected,
  className,
  onClick
}) => {
  const [css] = useStyletron();

  return (
    <div
      className={classNames(
        css({
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          height: VISIBLE_HEIGHT
        }),
        className
      )}
    >
      {elements.map(({ key, isSelectable, content, date }, i) => {
        const isSelected = i === selected;
        const hasPrev = i > 0;

        return (
          <Fragment key={key}>
            {hasPrev && <TimelineRow />}
            <TimelineRow
              element={{
                id: key,
                isSelected,
                content,
                date,
                onClick: isSelectable ? onClick : undefined
              }}
            />
          </Fragment>
        );
      })}
    </div>
  );
};
