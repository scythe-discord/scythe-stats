import { FunctionComponent } from 'react';
import {
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from 'recharts';

import GQL from '../../lib/graphql';

interface Props {
  faction: GQL.Faction;
}

const FactionWinRatesByPlayerCount: FunctionComponent<Props> = ({
  faction
}) => {
  const data = faction.statsByPlayerCount.map(
    ({ playerCount, totalMatches, totalWins }) => {
      const winRate = (100 * totalWins) / totalMatches;

      return {
        playerCount,
        value: winRate
      };
    }
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <Tooltip
          formatter={value => {
            const winRate = `${Number(value).toFixed(2)}%`;
            return [winRate, 'Win Rate'];
          }}
          labelFormatter={(playerCount: number) => {
            return `${playerCount} Players`;
          }}
        />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="playerCount" />
        <YAxis
          width={40}
          tickFormatter={val => {
            return `${val}%`;
          }}
        />
        <Line dataKey="value" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FactionWinRatesByPlayerCount;
