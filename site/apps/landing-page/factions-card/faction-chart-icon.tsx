import { FC, useCallback } from 'react';

import GQL from '../../../lib/graphql';
import { FactionIcon } from '../../../lib/components';

const ICON_SIZE = 28;

interface Props {
  // Deceivingly optional props - will be supplied by recharts
  payload?: {
    value: number;
  };
  // ... where the last two optional props are actually just here to be removed
  // because React doesn't recognize these attributes
  visibleTicksCount?: any;
  verticalAnchor?: any;
  factions: Pick<GQL.Faction, 'id' | 'name' | 'totalWins' | 'totalMatches'>[];
  selectedFactionIdx: number;
  onClickFaction: (idx: number) => void;
}

const FactionChartIcon: FC<Props> = ({
  payload,
  factions,
  selectedFactionIdx,
  onClickFaction,
  // eslint-disable-next-line
  visibleTicksCount,
  // eslint-disable-next-line
  verticalAnchor,
  ...props
}) => {
  const onClick = useCallback(() => {
    if (payload && payload.value != null) {
      onClickFaction(payload.value);
    }
  }, [onClickFaction, payload]);

  if (!payload) {
    return null;
  }

  const faction = factions[payload.value];
  const isSelected = selectedFactionIdx === payload.value;

  return (
    <g
      // Crude way to center the icon on its tick
      transform="translate(-14)"
      opacity={isSelected ? 1 : 0.65}
      cursor="pointer"
    >
      <foreignObject
        {...props}
        width={ICON_SIZE}
        height={ICON_SIZE}
        onClick={onClick}
      >
        <FactionIcon faction={faction.name} size={ICON_SIZE} />
      </foreignObject>
    </g>
  );
};

export default FactionChartIcon;
