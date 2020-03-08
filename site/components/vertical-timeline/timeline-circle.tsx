import { FC, useCallback } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

interface Props {
  id: string;
  isSelected: boolean;
  size: number;
  rawContentDescriptor: string;
  className?: string;
  onClick?: (id: string) => void;
}

const TimelineCircle: FC<Props> = ({
  id,
  size,
  className,
  isSelected,
  rawContentDescriptor,
  onClick
}) => {
  const [css, theme] = useStyletron();
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
          padding: 0,
          margin: 0
        }),
        className
      )}
      aria-label={rawContentDescriptor}
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
            stroke: '#419fff',
            strokeWidth: '10px'
          })}
          cx={50}
          cy={50}
          r={45}
        />
        {
          <circle
            className={css({
              fill: isSelected ? '#419fff' : 'white',
              stroke: 'none',
              transition: `fill ${theme.animation.timing100} ${theme.animation.easeInOutCurve}`
            })}
            cx={50}
            cy={50}
            r={25}
          />
        }
      </svg>
    </button>
  );
};

export default TimelineCircle;
