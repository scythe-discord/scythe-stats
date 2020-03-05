import { FunctionComponent, useCallback } from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Cell,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import GQL from '../../lib/graphql';

import FactionChartIcon from './faction-chart-icon';

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name' | 'totalWins' | 'totalMatches'>[];
  selectedFactionIdx: number;
  onClickFaction: (idx: number) => void;
}

const FactionWinRates: FunctionComponent<Props> = ({
  factions,
  selectedFactionIdx,
  onClickFaction
}) => {
  const onClickBar = useCallback(
    ({ idx }) => {
      onClickFaction(idx);
    },
    [onClickFaction]
  );

  const data = factions.map(({ totalMatches, totalWins }, idx) => {
    const winRate = (100 * totalWins) / totalMatches;

    return {
      idx,
      value: winRate
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        barCategoryGap="15%"
        margin={{ top: 5, right: 5, bottom: 10, left: 5 }}
        data={data}
      >
        <Tooltip
          cursor={{
            fill: '#ededed'
          }}
          formatter={value => {
            const winRate = `${Number(value).toFixed(2)}%`;
            return [winRate, 'Win Rate'];
          }}
          labelFormatter={(idx: number) => {
            const faction = factions[idx];
            return faction.name;
          }}
        />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis
          dataKey="idx"
          tick={
            <FactionChartIcon
              factions={factions}
              selectedFactionIdx={selectedFactionIdx}
              onClickFaction={onClickFaction}
            />
          }
        />
        <YAxis
          width={40}
          tickFormatter={val => {
            return `${val}%`;
          }}
        />

        <Bar dataKey="value" onClick={onClickBar} fill="#419fff">
          {data.map((_, index) => (
            <Cell
              cursor="pointer"
              opacity={index === selectedFactionIdx ? 1 : 0.5}
              key={`cell-${index}`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FactionWinRates;
