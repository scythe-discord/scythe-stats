import { gql } from 'graphql-tag';
import { Equal } from 'typeorm';

import { scytheDb } from '../../../db';
import { PlayerMatchResult, MatComboTier } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  type FactionMatCombo {
    faction: Faction!
    playerMat: PlayerMat!
    topPlayers(first: Int!): [PlayerFactionStats!]!
    tier: Tier!
    totalWins(playerCounts: [Int!]): Int!
    totalMatches(playerCounts: [Int!]): Int!
    avgCoinsOnWin(playerCounts: [Int!]): Int!
    avgRoundsOnWin(playerCounts: [Int!]): Float!
    leastRoundsForWin(playerCounts: [Int!]): Int!
    statsByPlayerCount: [FactionMatComboStatsWithPlayerCount!]!
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionMatCombo: {
    tier: async ({ faction, playerMat }) => {
      const matComboTierRepo = scytheDb.getRepository(MatComboTier);

      const matComboTier = await matComboTierRepo.findOneOrFail({
        where: {
          faction: Equal(faction.id),
          playerMat: Equal(playerMat.id),
        },
        relations: ['tier'],
      });

      return matComboTier.tier;
    },
    topPlayers: async (
      { faction: { id: factionId }, playerMat: { id: playerMatId } },
      { first }
    ) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      const playersWithWins = await pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr."playerId")', 'totalWins')
        .addSelect('player.*')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'temp')
              .select('MAX(temp.coins)', 'maxCoins')
              .addSelect('temp."matchId"')
              .groupBy('temp."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .innerJoin('pmr.player', 'player')
        .where(
          'pmr."tieOrder" = 0 AND pmr."factionId" = :factionId AND pmr."playerMatId" = :playerMatId',
          {
            factionId,
            playerMatId,
          }
        )
        .groupBy('player.id')
        .orderBy('"totalWins"', 'DESC')
        .addOrderBy('player.id', 'ASC')
        .limit(first)
        .getRawMany();

      return playersWithWins.map(({ totalWins, ...playerDetails }) => ({
        player: playerDetails,
        totalWins,
      }));
    },
    totalWins: async ({ faction, playerMat }, args, { dataSources }) => {
      const winStats = await dataSources.factionMatStats.getWinStats(
        faction.id,
        playerMat.id
      );

      return winStats?.totalWins || 0;
    },
    totalMatches: async ({ faction, playerMat }, args, { dataSources }) => {
      const totalStats = await dataSources.factionMatStats.getTotalStats(
        faction.id,
        playerMat.id
      );

      return totalStats?.totalMatches || 0;
    },
    avgCoinsOnWin: async ({ faction, playerMat }, args, { dataSources }) => {
      const winStats = await dataSources.factionMatStats.getWinStats(
        faction.id,
        playerMat.id
      );

      return winStats?.avgCoins || 0;
    },
    avgRoundsOnWin: async ({ faction, playerMat }, args, { dataSources }) => {
      const winStats = await dataSources.factionMatStats.getWinStats(
        faction.id,
        playerMat.id
      );

      return winStats?.avgRounds || 0;
    },
    leastRoundsForWin: async (
      { faction, playerMat },
      args,
      { dataSources }
    ) => {
      const winStats = await dataSources.factionMatStats.getWinStats(
        faction.id,
        playerMat.id
      );

      return winStats?.minRounds || 0;
    },
  },
};
