import { FC, useCallback } from 'react';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

const ICON_SIZE = 36;

interface Props {
  // Deceivingly optional props - will be supplied by recharts
  payload?: {
    value: number;
  };
  combos: {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  }[];
  onClick: (factionId: number) => void;
  selectedFactionId: number;
  // ... where the last two optional props are actually just here to be removed
  // because React doesn't recognize these attributes
  visibleTicksCount?: any;
  verticalAnchor?: any;
}

const FactionChartIcon: FC<Props> = ({
  payload,
  combos,
  selectedFactionId,
  // eslint-disable-next-line
  visibleTicksCount,
  // eslint-disable-next-line
  verticalAnchor,
  onClick,
  ...props
}) => {
  if (!payload) {
    return null;
  }

  const combo = combos[payload.value];
  const isSelected = combo.faction.id === selectedFactionId;

  const onClickWrapper = useCallback(() => onClick(combo.faction.id), [
    onClick,
    combo,
  ]);

  return (
    <g
      // Crude way to center the icon on its tick
      transform="translate(-18)"
      cursor="pointer"
      opacity={isSelected ? 1 : 0.65}
    >
      <foreignObject
        {...props}
        width={ICON_SIZE}
        height={ICON_SIZE}
        onClick={onClickWrapper}
      >
        <FactionIcon faction={combo.faction.name} size={ICON_SIZE} />
      </foreignObject>
    </g>
  );
};

export default FactionChartIcon;
