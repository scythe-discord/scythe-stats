import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import {
  Faction,
  PlayerMat,
  PlayerMatchResult,
  MatComboTier,
} from '../../../db/entities';
import Schema from '../codegen';

export interface FactionMatComboBase {
  faction: Faction;
  playerMat: PlayerMat;
}

export const typeDef = gql`
  type FactionMatCombo {
    faction: Faction!
    playerMat: PlayerMat!
    topPlayers(first: Int!): [PlayerFactionStats!]!
    tier: Tier!
    totalWins: Int!
    totalMatches: Int!
    avgCoinsOnWin: Int!
    avgRoundsOnWin: Float!
    leastRoundsForWin: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  FactionMatCombo: {
    tier: async ({ faction, playerMat }) => {
      const matComboTierRepo = getRepository(MatComboTier);

      const matComboTier = await matComboTierRepo.findOneOrFail({
        where: {
          faction,
          playerMat,
        },
        relations: ['tier'],
      });

      return matComboTier.tier;
    },
    topPlayers: async (
      { faction: { id: factionId }, playerMat: { id: playerMatId } },
      { first }
    ) => {
      const pmrRepo = getRepository(PlayerMatchResult);
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
    totalWins: async ({ faction, playerMat }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      const wins = await pmrRepo
        .createQueryBuilder('pmr')
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
        .where(
          'pmr."tieOrder" = 0 AND pmr."factionId" = :factionId AND pmr."playerMatId" = :playerMatId',
          {
            factionId: faction.id,
            playerMatId: playerMat.id,
          }
        )
        .getCount();

      return wins;
    },
    totalMatches: async ({ faction, playerMat }) => {
      const playerMatchResultRepo = getRepository(PlayerMatchResult);
      const matches = await playerMatchResultRepo
        .createQueryBuilder('result')
        .where('result."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('result."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getCount();
      return matches;
    },
    avgCoinsOnWin: async ({ faction, playerMat }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      const res = await pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(pmr.coins)', 'avg')
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
        .where(
          'pmr."tieOrder" = 0 AND pmr."factionId" = :factionId AND pmr."playerMatId" = :playerMatId',
          {
            factionId: faction.id,
            playerMatId: playerMat.id,
          }
        )
        .getRawOne();

      return Math.floor(parseFloat(res['avg'])) || 0;
    },
    avgRoundsOnWin: async ({ faction, playerMat }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      const res = await pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(match."numRounds")', 'avg')
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
        .innerJoin('pmr.match', 'match')
        .where(
          'pmr."tieOrder" = 0 AND pmr."factionId" = :factionId AND pmr."playerMatId" = :playerMatId',
          {
            factionId: faction.id,
            playerMatId: playerMat.id,
          }
        )
        .getRawOne();

      return parseFloat(res['avg']) || 0;
    },
    leastRoundsForWin: async ({ faction, playerMat }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      const res = await pmrRepo
        .createQueryBuilder('pmr')
        .select('MIN(match."numRounds")', 'min')
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
        .innerJoin('pmr.match', 'match')
        .where(
          'pmr."tieOrder" = 0 AND pmr."factionId" = :factionId AND pmr."playerMatId" = :playerMatId',
          {
            factionId: faction.id,
            playerMatId: playerMat.id,
          }
        )
        .getRawOne();

      return res['min'] || 0;
    },
  },
};
