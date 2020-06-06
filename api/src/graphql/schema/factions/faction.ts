import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import { Faction, PlayerMatchResult, PlayerMat } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    faction(id: Int!): Faction!
    factions: [Faction!]!
  }

  type PlayerFactionStats {
    player: Player!
    totalWins: Int!
  }

  type Faction {
    id: Int!
    name: String!
    totalWins: Int!
    totalMatches: Int!
    statsByPlayerCount: [FactionStatsWithPlayerCount!]!
    factionMatCombos: [FactionMatCombo!]!
    topPlayers(first: Int!): [PlayerFactionStats!]!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    faction: async (_, { id }) => {
      const factionRepo = getRepository(Faction);
      const faction = await factionRepo.findOneOrFail({
        id,
      });

      return faction;
    },
    factions: async () => {
      const factionRepo = getRepository(Faction);
      const allFactions = await factionRepo.find();
      return allFactions;
    },
  },
  Faction: {
    totalWins: async (faction) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      const wins = await pmrRepo
        .createQueryBuilder('pmr')
        .select('pmr.id')
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
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .getCount();
      return wins;
    },
    totalMatches: async (faction) => {
      const playerMatchResultRepo = getRepository(PlayerMatchResult);
      const matches = await playerMatchResultRepo
        .createQueryBuilder('result')
        .where('result."factionId" = :factionId', {
          factionId: faction.id,
        })
        .getCount();
      return matches;
    },
    factionMatCombos: async (faction) => {
      const playerMatRepo = getRepository(PlayerMat);
      const playerMats = await playerMatRepo.find();
      return playerMats.map((playerMat) => ({
        faction,
        playerMat,
      }));
    },
    topPlayers: async ({ id: factionId }, { first }) => {
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
        .where('pmr."tieOrder" = 0 AND pmr."factionId" = :factionId', {
          factionId,
        })
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
  },
};
