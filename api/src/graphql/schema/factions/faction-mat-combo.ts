import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import {
  Faction,
  PlayerMat,
  Match,
  PlayerMatchResult
} from '../../../db/entities';
import Schema from '../codegen';

export interface FactionMatComboBase {
  faction: Faction;
  playerMat: PlayerMat;
}

export const typeDef = gql`
  extend type Query {
    factionMatCombos(factionId: Int!): [FactionMatCombo!]!
  }

  type FactionMatCombo {
    faction: Faction!
    playerMat: PlayerMat!
    totalWins: Int!
    totalMatches: Int!
    avgCoinsOnWin: Int!
    avgRoundsOnWin: Float!
    leastRoundsForWin: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    factionMatCombos: async (_, { factionId }) => {
      const factionRepo = getRepository(Faction);
      const playerMatRepo = getRepository(PlayerMat);

      const faction = await factionRepo.findOneOrFail(factionId);
      const playerMats = await playerMatRepo.find();

      return playerMats.map(playerMat => ({
        faction,
        playerMat
      }));
    }
  },
  FactionMatCombo: {
    totalWins: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const wins = await matchRepo
        .createQueryBuilder('match')
        .innerJoinAndSelect('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id
        })
        .getCount();
      return wins;
    },
    totalMatches: async ({ faction, playerMat }) => {
      const playerMatchResultRepo = getRepository(PlayerMatchResult);
      const matches = await playerMatchResultRepo
        .createQueryBuilder('result')
        .where('result."factionId" = :factionId', {
          factionId: faction.id
        })
        .andWhere('result."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id
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
          playerMatId: playerMat.id
        })
        .getRawOne();

      return Math.floor(parseFloat(res['avg']));
    },
    avgRoundsOnWin: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const res = await matchRepo
        .createQueryBuilder('match')
        .select('AVG(match.numRounds)', 'avg')
        .innerJoin('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id
        })
        .getRawOne();

      return parseFloat(res['avg']);
    },
    leastRoundsForWin: async ({ faction, playerMat }) => {
      const matchRepo = getRepository(Match);
      const res = await matchRepo
        .createQueryBuilder('match')
        .select('MIN(match.numRounds)', 'min')
        .innerJoin('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .andWhere('winner."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id
        })
        .getRawOne();

      return res['min'];
    }
  }
};
