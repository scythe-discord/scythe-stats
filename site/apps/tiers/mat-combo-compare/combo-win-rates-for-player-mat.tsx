import { FC, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { HeadingSmall } from 'baseui/typography';
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

import GQL from '../../../lib/graphql';
import FactionChartIcon from './faction-chart-icon';

interface Props {
  combos: (Pick<GQL.FactionMatCombo, 'totalWins' | 'totalMatches'> & {
    faction: Pick<GQL.Faction, 'id' | 'name'>;
    playerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  })[];
  selectedPlayerMat: Pick<GQL.PlayerMat, 'id' | 'name'>;
  selectedFaction: Pick<GQL.Faction, 'id' | 'name'>;
  onClickMatCombo: (factionId: number, playerMatId: number) => void;
}

const ComboWinRatesForPlayerMat: FC<Props> = ({
  combos,
  selectedPlayerMat,
  selectedFaction,
  onClickMatCombo,
}) => {
  const [css, theme] = useStyletron();
  const orderedFactions = combos.sort((a, b) => {
    if (a.faction.id < b.faction.id) {
      return -1;
    }

    return 1;
  });
  const onClickBar = useCallback(
    ({ idx }) => {
      const combo = orderedFactions[idx];
      onClickMatCombo(combo.faction.id, combo.playerMat.id);
    },
    [orderedFactions, onClickMatCombo]
  );
  const onClickFactionIcon = useCallback(
    (factionId: number) => {
      const combo = orderedFactions.find(
        (combo) => combo.faction.id === factionId
      );

      if (combo) {
        onClickMatCombo(combo.faction.id, combo.playerMat.id);
      }
    },
    [orderedFactions, onClickMatCombo]
  );

  const selectedIndex = orderedFactions.findIndex(
    ({ faction }) => faction.id === selectedFaction.id
  );

  const data = orderedFactions.map(({ totalMatches, totalWins }, idx) => {
    const winRate = (100 * totalWins) / totalMatches;

    return {
      idx: idx,
      value: winRate,
    };
  });

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 0,

        [theme.mediaQuery.medium]: {
          flex: '1 1 50%',
          alignItems: 'stretch',
          padding: '0 0 0 10px',
        },

        [theme.mediaQuery.large]: {
          alignItems: 'center',
        },
      })}
    >
      <HeadingSmall
        overrides={{
          Block: {
            style: {
              margin: '0 0 20px',
            },
          },
        }}
      >
        {selectedPlayerMat.name} win rates
      </HeadingSmall>

      <div
        className={css({
          alignSelf: 'stretch',
          height: '350px',

          [theme.mediaQuery.large]: {
            flex: '1 1 auto',
          },
        })}
      >
        <ResponsiveContainer
          id="same-player-mat-win-rates"
          width="100%"
          height="100%"
        >
          <BarChart
            barCategoryGap="15%"
            margin={{ top: 0, right: 0, bottom: 15, left: 0 }}
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
              tick={
                <FactionChartIcon
                  combos={orderedFactions}
                  selectedFactionId={selectedFaction.id}
                  onClick={onClickFactionIcon}
                />
              }
            />
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
      </div>
    </div>
  );
};

export default ComboWinRatesForPlayerMat;
