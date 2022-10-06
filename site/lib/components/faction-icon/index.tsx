import { FC } from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { StatefulTooltip, PLACEMENT } from 'baseui/tooltip';
import classNames from 'classnames';

import { getFactionEmblem } from 'lib/scythe';
import Image from 'next/image';

interface Props {
  faction: string;
  size?: number;
  className?: string;
}

const FactionIcon: FC<Props> = ({ faction, size = 16, className }) => {
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
      <Image
        src={emblemSrc}
        alt={faction}
        width={size}
        height={size}
        className={classNames(
          css({
            cursor: 'pointer',
          }),
          className
        )}
      />
    </StatefulTooltip>
  );
};

export default FactionIcon;
