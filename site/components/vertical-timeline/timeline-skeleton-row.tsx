import { FC } from 'react';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';
import ContentLoader from 'react-content-loader';

import { DATE_TXT_WIDTH, CIRCLE_SIZE } from './dimensions';
import TimelineCircle from './timeline-circle';

const LOADING_ELLIPSES_SIZE = '5px';
const SKELETON_CONTENT_WIDTH = 300;
const SKELETON_CONTENT_HEIGHT = 40;

const LoadingEllipses: FC = () => {
  const [css, theme] = useStyletron();
  return (
    <>
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <svg
            key={i}
            viewBox={`0 0 100 100`}
            className={css({
              display: 'block',
              width: LOADING_ELLIPSES_SIZE,
              height: LOADING_ELLIPSES_SIZE,
              overflow: 'visible',
              margin: '0 0 0 10px',
              [':first-child']: {
                marginLeft: '0'
              }
            })}
          >
            <circle
              className={css({
                fill: theme.colors.primaryA,
                stroke: theme.colors.primaryA
              })}
              cx={50}
              cy={50}
              r={50}
            />
          </svg>
        ))}
    </>
  );
};

interface Props {
  idx: number;
}

const TimelineSkeletonRow: FC<Props> = ({ idx }) => {
  const [css, theme] = useStyletron();

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: `0 0 auto`,
              width: `${DATE_TXT_WIDTH}px`,
              textAlign: 'right',
              padding: '0 20px 0 0'
            }
          }
        }}
      >
        <LoadingEllipses />
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
          size={CIRCLE_SIZE}
          isSelected={false}
          rawContentDescriptor="Loading..."
        />
      </div>
      <div
        className={css({
          padding: '0 0 0 15px'
        })}
      >
        <ContentLoader
          uniqueKey={`${idx}`}
          className={css({
            display: 'block'
          })}
          speed={2}
          width={`${SKELETON_CONTENT_WIDTH}px`}
          height={`${SKELETON_CONTENT_HEIGHT}px`}
          viewBox={`0 0 ${SKELETON_CONTENT_WIDTH} ${SKELETON_CONTENT_HEIGHT}`}
          backgroundColor={theme.colors.primary100}
          foregroundColor={theme.colors.primary200}
        >
          <rect
            x="0"
            y="0"
            rx="3"
            ry="3"
            width={`${SKELETON_CONTENT_WIDTH}px`}
            height={`${SKELETON_CONTENT_HEIGHT}px`}
          />
        </ContentLoader>
      </div>
    </div>
  );
};

export default TimelineSkeletonRow;
