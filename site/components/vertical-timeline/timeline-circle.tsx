import { FunctionComponent, useCallback } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

const DEFAULT_RADIUS = 30;

interface Props {
  id: string;
  isSelected: boolean;
  size?: number;
  className?: string;
  onClick?: (id: string) => void;
}

const TimelineCircle: FunctionComponent<Props> = ({
  id,
  isSelected,
  size = DEFAULT_RADIUS,
  className,
  onClick
}) => {
  const [css] = useStyletron();
  const onClickWithId = useCallback(() => {
    if (onClick) {
      onClick(id);
    }
  }, [onClick, id]);

  return (
    <button
      className={classNames(
        css({
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0
        })
      )}
      onClick={onClickWithId}
    >
      <svg
        viewBox={`0 0 100 100`}
        className={classNames(
          css({
            display: 'block',
            width: `${size}px`,
            height: `${size}px`,
            overflow: 'visible'
          })
        )}
      >
        <circle
          className={css({
            fill: 'white',
            stroke: '#3498db',
            strokeWidth: '5px'
          })}
          cx={50}
          cy={50}
          r={50}
        />
      </svg>
    </button>
  );
};

export default TimelineCircle;
