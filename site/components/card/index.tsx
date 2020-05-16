import { FC, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

interface Props {
  className?: string;
  children: ReactNode;
}

const Card: FC<Props> = ({ className, children }) => {
  const [css, theme] = useStyletron();

  return (
    <div
      className={classNames(
        css({
          background: theme.colors.backgroundSecondary,
          padding: '35px',
          boxShadow: 'rgba(0, 0, 0, 0.15) 0 2px 8px',
        }),
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
