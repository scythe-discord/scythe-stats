import { Fragment, FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroller';

import TimelineRow from './timeline-row';
import TimelineSpacer from './timeline-spacer';

export interface TimelineElement {
  key: string;
  isSelectable: boolean;
  content: ReactNode;
  rawContentDescriptor: string;
  date: string;
}

interface Props {
  elements: TimelineElement[];
  selected: number;
  width: string;
  maxHeight: string;
  className?: string;
  onClick?: (key: string) => void;
  loadMore?: (page: number) => void;
  hasMore?: boolean;
}

export const VerticalTimeline: FC<Props> = ({
  elements,
  selected,
  width,
  maxHeight,
  className,
  onClick,
  loadMore,
  hasMore
}) => {
  const [css] = useStyletron();

  const timelineElements = elements.map(
    ({ key, isSelectable, content, rawContentDescriptor, date }, i) => {
      const isSelected = i === selected;
      const hasPrev = i > 0;

      return (
        <Fragment key={key}>
          {hasPrev && <TimelineSpacer />}
          <TimelineRow
            id={key}
            isSelected={isSelected}
            content={content}
            rawContentDescriptor={rawContentDescriptor}
            date={date}
            onClick={isSelectable ? onClick : undefined}
          />
        </Fragment>
      );
    }
  );

  return (
    <div
      className={classNames(
        css({
          padding: '5px 0',
          width,
          maxHeight,
          overflow: 'auto'
        }),
        className
      )}
    >
      {loadMore && hasMore !== undefined ? (
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} useWindow={false}>
          {timelineElements}
        </InfiniteScroll>
      ) : (
        timelineElements
      )}
    </div>
  );
};
