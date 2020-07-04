import { FC } from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { StatefulTooltip, PLACEMENT } from 'baseui/tooltip';
import classNames from 'classnames';

import { getFactionEmblem } from '../../scythe';

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
    <StatefulTooltip
      placement={PLACEMENT.bottom}
      ignoreBoundary={true}
      content={() => <Block>{faction}</Block>}
    >
      <img
        src={emblemSrc}
        alt={faction}
        className={classNames(
          css({
            width: `${size}px` || '16px',
            cursor: 'pointer',
          }),
          className
        )}
      />
    </StatefulTooltip>
  );
};

export default FactionIcon;
