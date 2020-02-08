import { FC } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';

import { getFactionEmblem } from '../../lib/scythe';

interface Props {
  faction: string;
  size?: number;
  className?: string;
}

const FactionIcon: FC<Props> = ({ faction, size, className }) => {
  const [css] = useStyletron();
  const emblemSrc = getFactionEmblem(faction);

  if (!emblemSrc) {
    return null;
  }

  return (
    <img
      src={emblemSrc}
      className={classNames(
        css({
          width: `${size}px` || '16px'
        }),
        className
      )}
    />
  );
};

export default FactionIcon;
