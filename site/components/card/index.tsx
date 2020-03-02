import { FunctionComponent, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

interface Props {
  className?: string;
  children: ReactNode;
}

const Card: FunctionComponent<Props> = ({ className, children }) => {
  const [css] = useStyletron();

  return (
    <div
      className={classNames(
        css({
          background: '#fff',
          border: 'none',
          padding: '35px',
          boxShadow: 'rgba(0, 0, 0, 0.15) 0 2px 8px'
        }),
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
