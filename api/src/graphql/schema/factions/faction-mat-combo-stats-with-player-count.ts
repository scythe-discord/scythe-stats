import { gql } from 'graphql-tag';
import {
  ComboTotalStats,
  ComboWinStats,
} from '../../data-sources/faction-mat-stats';

import Schema from '../codegen';

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7];

const DEFAULT_COMBO_TOTAL_STATS: ComboTotalStats = {
  totalMatches: 0,
};

const DEFAULT_COMBO_WIN_STATS: ComboWinStats = {
  totalWins: 0,
  avgCoins: 0,
  avgRounds: 0,
  minRounds: 0,
};

export const typeDef = gql`
  type FactionMatComboStatsWithPlayerCount {
    playerCount: Int!
    totalWins: Int!
    totalMatches: Int!
    avgCoinsOnWin: Float!
    avgRoundsOnWin: Float!
    leastRoundsForWin: Int
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionMatCombo: {
    statsByPlayerCount: async (
      { faction, playerMat },
      parent,
      { dataSources }
    ) => {
      const totalStatsByPlayerCount =
        await dataSources.factionMatStats.getTotalStatsByPlayerCount(
          faction.id,
          playerMat.id
        );
      const winStatsByPlayerCount =
        await dataSources.factionMatStats.getWinStatsByPlayerCount(
          faction.id,
          playerMat.id
        );

      return PLAYER_COUNTS.map((playerCount) => {
        const totalStats =
          totalStatsByPlayerCount?.get(playerCount) ||
          DEFAULT_COMBO_TOTAL_STATS;
        const winStats =
          winStatsByPlayerCount?.get(playerCount) || DEFAULT_COMBO_WIN_STATS;

        return {
          playerCount,
          faction,
          playerMat,
          ...totalStats,
          totalWins: winStats.totalWins,
          avgCoinsOnWin: winStats.avgCoins,
          avgRoundsOnWin: winStats.avgRounds,
          leastRoundsForWin:
            winStats.minRounds === 0 ? null : winStats.minRounds,
        };
      });
    },
  },
};
