import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import {
  Faction,
  Match,
  PlayerMatchResult,
  PlayerMat,
} from '../../../db/entities';
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
      const matchRepo = getRepository(Match);
      const wins = await matchRepo
        .createQueryBuilder('match')
        .innerJoinAndSelect('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
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
      const matchRepository = getRepository(Match);
      const playersWithWins = await matchRepository
        .createQueryBuilder('match')
        .innerJoin('match.winner', 'winner')
        .innerJoin('winner.player', 'player')
        .where('winner."factionId" = :factionId', { factionId })
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
  },
};
