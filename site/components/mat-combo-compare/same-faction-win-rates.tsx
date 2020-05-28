import { FC, useCallback } from 'react';
import { useStyletron } from 'baseui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import GQL from '../../lib/graphql';

interface Props {
  combos: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  })[];
  selectedPlayerMatId: number;
  onClickMatCombo: (factionId: number, playerMatId: number) => void;
}

const SameFactionWinRates: FC<Props> = ({
  combos,
  selectedPlayerMatId,
  onClickMatCombo,
}) => {
  const [_, theme] = useStyletron();
  const orderedPlayerMats = combos.sort((a, b) => {
    if (a.playerMat.id < b.playerMat.id) {
      return -1;
    }

    return 1;
  });
  const onClickBar = useCallback(
    ({ name }) => {
      const combo = orderedPlayerMats.find(
        (combo) => combo.playerMat.name === name
      );

      if (combo) {
        onClickMatCombo(combo.faction.id, combo.playerMat.id);
      }
    },
    [orderedPlayerMats, onClickMatCombo]
  );

  const selectedIndex = orderedPlayerMats.findIndex(
    ({ playerMat }) => playerMat.id === selectedPlayerMatId
  );

  const data = orderedPlayerMats.map(
    ({ playerMat, totalMatches, totalWins }) => {
      const winRate = (100 * totalWins) / totalMatches;

      return {
        name: playerMat.name,
        value: winRate,
      };
    }
  );

  return (
    <ResponsiveContainer id="same-faction-win-rates" width="100%" height="100%">
      <BarChart
        barCategoryGap="15%"
        margin={{ top: 10, right: 15, bottom: 0, left: 5 }}
        data={data}
      >
        <Tooltip
          cursor={{
            // @ts-ignore - because for some reason this works in recharts beta
            fill: theme.colors.primary700,
            strokeDasharray: 'none',
          }}
          formatter={(value: string) => {
            const winRate = `${Number(value).toFixed(2)}%`;
            return [winRate, 'Win Rate'];
          }}
        />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis
          width={40}
          tickFormatter={(val) => {
            return `${val}%`;
          }}
        />
        <Bar dataKey="value" fill="#1f78c1" onClick={onClickBar}>
          {data.map((_, index) => (
            <Cell
              cursor="pointer"
              key={`cell-${index}`}
              opacity={index === selectedIndex ? 1 : 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SameFactionWinRates;
