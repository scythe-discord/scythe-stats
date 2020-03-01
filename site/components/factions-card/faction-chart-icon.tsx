import { FunctionComponent, useCallback } from 'react';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

interface Props {
  // Deceivingly optional prop - will be supplied by recharts
  payload?: any;
  factions: Pick<GQL.Faction, 'id' | 'name' | 'totalWins' | 'totalMatches'>[];
  selectedFactionIdx: number;
  onClickFaction: (idx: number) => void;
}

const FactionChartIcon: FunctionComponent<Props> = ({
  payload,
  factions,
  selectedFactionIdx,
  onClickFaction,
  ...props
}) => {
  const onClick = useCallback(() => {
    if (payload && payload.value) {
      onClickFaction(payload.value);
    }
  }, [onClickFaction, payload]);

  if (!payload) {
    return null;
  }

  const faction = factions[payload.value];
  const isSelected = selectedFactionIdx === payload.value;

  return (
    <foreignObject
      width="28"
      height="28"
      transform="translate(-14)"
      onClick={onClick}
      opacity={isSelected ? 1 : 0.65}
      {...props}
    >
      <FactionIcon faction={faction.name} size={28} />
    </foreignObject>
  );
};

export default FactionChartIcon;
