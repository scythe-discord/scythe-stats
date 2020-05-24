import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import {
  Faction,
  PlayerMat,
  Match,
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
      const matchRepository = getRepository(Match);
      const playersWithWins = await matchRepository
        .createQueryBuilder('match')
        .innerJoin('match.winner', 'winner')
        .innerJoin('winner.player', 'player')
        .where(
          'winner."factionId" = :factionId AND winner."playerMatId" = :playerMatId',
          { factionId, playerMatId }
        )
        .groupBy('player.id')
        .select('COUNT(player.id)', 'totalWins')
        .addSelect('player.*')
        .orderBy('"totalWins"', 'DESC')
        .limit(first)
        .getRawMany();

      return playersWithWins.map(({ totalWins, ...playerDetails }) => ({
        player: playerDetails,
        totalWins,
      }));
    },
    totalWins: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const wins = await matchRepo
        .createQueryBuilder('match')
        .innerJoinAndSelect('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
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
      const matchRepo = getRepository(Match);
      const res = await matchRepo
        .createQueryBuilder('match')
        .select('AVG(winner.coins)', 'avg')
        .innerJoin('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne();

      return Math.floor(parseFloat(res['avg'])) || 0;
    },
    avgRoundsOnWin: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const res = await matchRepo
        .createQueryBuilder('match')
        .select('AVG(match.numRounds)', 'avg')
        .innerJoin('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne();

      return parseFloat(res['avg']) || 0;
    },
    leastRoundsForWin: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const res = await matchRepo
        .createQueryBuilder('match')
        .select('MIN(match.numRounds)', 'min')
        .innerJoin('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
        })
        .getRawOne();

      return res['min'] || 0;
    },
  },
};
