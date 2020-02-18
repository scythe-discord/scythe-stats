import { Fragment, FunctionComponent, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';

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

export const VerticalTimeline: FunctionComponent<Props> = ({
  elements,
  selected,
  className,
  onClick
}) => {
  const [css] = useStyletron();

  return (
    <Scrollbars
      style={{
        height: 275
      }}
      universal={true}
      className={classNames(
        css({
          padding: '5px 0'
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
    </Scrollbars>
  );
};
