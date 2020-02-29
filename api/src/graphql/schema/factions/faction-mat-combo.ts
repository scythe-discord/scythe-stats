import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Faction, PlayerMat, Match } from '../../../db/entities';
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
    }
  }
};
