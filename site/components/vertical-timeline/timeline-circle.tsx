import { FunctionComponent, useCallback } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

interface Props {
  key: string;
  isSelected: boolean;
  size: number;
  className?: string;
  onClick?: (key: string) => void;
}

const TimelineCircle: FunctionComponent<Props> = ({
  key,
  isSelected,
  size,
  className,
  onClick
}) => {
  const [css] = useStyletron();
  const onClickWithKey = useCallback(() => {
    if (onClick) {
      onClick(key);
    }
  }, [onClick, key]);

  return (
    <svg
      viewBox={`0 0 100 100`}
      className={classNames(
        css({
          width: `${size}px`,
          height: `${size}px`
        }),
        className
      )}
      onClick={onClickWithKey}
    >
      <circle cx={50} cy={50} r={50} />
    </svg>
  );
};

export default TimelineCircle;
