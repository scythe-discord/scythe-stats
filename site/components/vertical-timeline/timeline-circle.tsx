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
    <svg
      viewBox={`0 0 100 100`}
      className={classNames(
        css({
          display: 'block',
          width: `${size}px`,
          height: `${size}px`
        })
      )}
      onClick={onClickWithId}
    >
      <circle cx={50} cy={50} r={50} />
    </svg>
  );
};

export default TimelineCircle;
