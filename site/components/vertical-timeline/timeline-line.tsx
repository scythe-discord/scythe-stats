import { FunctionComponent } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

interface Props {
  height: number;
  width: number;
  className?: string;
}

const TimelineLine: FunctionComponent<Props> = ({
  width,
  height,
  className
}) => {
  const [css] = useStyletron();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={classNames(
        css({
          width: `${width}px`
        }),
        className
      )}
    >
      <line
        x1={width / 2}
        x2={width / 2}
        y1="0"
        y2={height}
        className={css({
          stroke: 'black',
          strokeWidth: `${width}px`
        })}
      />
    </svg>
  );
};

export default TimelineLine;
