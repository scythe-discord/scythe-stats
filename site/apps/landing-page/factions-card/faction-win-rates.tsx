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

import GQL from 'lib/graphql';

import FactionChartIcon from './faction-chart-icon';

interface Props {
  factions: (Pick<GQL.Faction, 'id' | 'name'> & {
    statsByPlayerCount: Array<
      Pick<
        GQL.FactionStatsWithPlayerCount,
        'playerCount' | 'totalWins' | 'totalMatches'
      >
    >;
  })[];
  selectedFactionIdx: number;
  selectedPlayerCounts: Set<number>;
  onClickFaction: (idx: number) => void;
}

const FactionWinRates: FC<Props> = ({
  factions,
  selectedFactionIdx,
  selectedPlayerCounts,
  onClickFaction,
}) => {
  const [_, theme] = useStyletron();
  const onClickBar = useCallback(
    ({ idx }: { idx: number }) => {
      onClickFaction(idx);
    },
    [onClickFaction]
  );

  const data = factions.map(({ statsByPlayerCount }, idx) => {
    const relevantStats = statsByPlayerCount.filter(({ playerCount }) =>
      selectedPlayerCounts.has(playerCount)
    );
    const totalWins = relevantStats.reduce(
      (prevVal, currVal) => prevVal + currVal.totalWins,
      0
    );
    const totalMatches = relevantStats.reduce(
      (prevVal, currVal) => prevVal + currVal.totalMatches,
      0
    );
    const winRate = (100 * totalWins) / totalMatches;

    return {
      idx,
      value: winRate,
    };
  });

  return (
    // id is specified because it's otherwise "undefined", for some reason
    <ResponsiveContainer id="faction-win-rates" width="100%" height="100%">
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
          tickFormatter={(val) => {
            return `${val}%`;
          }}
        />

        <Bar dataKey="value" onClick={onClickBar} fill="#1f78c1">
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
