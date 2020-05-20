import { FC } from 'react';
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
import FactionChartIcon from './faction-chart-icon';

interface Props {
  combos: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  })[];
  selectedFactionId: number;
}

const SamePlayerMatWinRates: FC<Props> = ({ combos, selectedFactionId }) => {
  const [_, theme] = useStyletron();
  const orderedFactions = combos.sort((a, b) => {
    if (a.faction.id === selectedFactionId) {
      return -1;
    } else if (b.faction.id === selectedFactionId) {
      return 1;
    } else if (a.faction.id < b.faction.id) {
      return -1;
    }

    return 1;
  });

  const data = orderedFactions.map(({ totalMatches, totalWins }, idx) => {
    const winRate = (100 * totalWins) / totalMatches;

    return {
      idx: idx,
      value: winRate,
    };
  });

  return (
    <ResponsiveContainer
      id="same-player-mat-win-rates"
      width="50%"
      height="100%"
    >
      <BarChart
        barCategoryGap="15%"
        margin={{ top: 5, right: 5, bottom: 10, left: 5 }}
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
          labelFormatter={(idx: number) => {
            const combo = orderedFactions[idx];
            return combo.faction.name;
          }}
        />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis
          dataKey="idx"
          tick={<FactionChartIcon combos={orderedFactions} />}
        />
        <YAxis
          width={40}
          tickFormatter={(val) => {
            return `${val}%`;
          }}
        />
        <Bar dataKey="value" fill="#1f78c1">
          {data.map((_, index) => (
            <Cell cursor="pointer" key={`cell-${index}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SamePlayerMatWinRates;
