import { Fragment, FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroller';

import TimelineDataRow from './timeline-data-row';
import TimelineSkeletonRow from './timeline-skeleton-row';
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
  isLoading?: boolean;
  hasMore?: boolean;
  numLoadingElements?: number;
}

export const VerticalTimeline: FC<Props> = ({
  elements,
  selected,
  width,
  maxHeight,
  className,
  onClick,
  loadMore,
  isLoading,
  hasMore,
  numLoadingElements,
}) => {
  const [css] = useStyletron();

  const timelineElements = elements.map(
    ({ key, isSelectable, content, rawContentDescriptor, date }, i) => {
      const isSelected = i === selected;
      const hasPrev = i > 0;

      return (
        <Fragment key={key}>
          {hasPrev && <TimelineSpacer />}
          <TimelineDataRow
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

  if (isLoading && numLoadingElements) {
    for (let i = 0; i < numLoadingElements; i++) {
      timelineElements.push(
        <Fragment key={i}>
          {timelineElements.length > 0 ? <TimelineSpacer /> : null}
          <TimelineSkeletonRow idx={timelineElements.length} />
        </Fragment>
      );
    }
  }

  return (
    <div
      className={classNames(
        css({
          padding: '5px 0',
          width,
          maxHeight,
          overflow: 'auto',
        }),
        className
      )}
    >
      {loadMore && hasMore !== undefined ? (
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          useWindow={false}
          threshold={50}
        >
          {timelineElements}
        </InfiniteScroll>
      ) : (
        timelineElements
      )}
    </div>
  );
};
