import { gql } from 'apollo-server';
import { getRepository } from 'typeorm';

import { Faction, Match, PlayerMatchResult } from '../../../db/entities';
import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    faction(name: String!): Faction
    factions: [Faction!]!
  }

  type Faction {
    id: Int!
    name: String!
    totalWins: Int!
    totalMatches: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    faction: async (_, { name }) => {
      const factionRepo = getRepository(Faction);
      const faction = await factionRepo.findOne({
        name
      });

      return faction || null;
    },
    factions: async () => {
      const factionRepo = getRepository(Faction);
      const allFactions = await factionRepo.find();
      return allFactions;
    }
  },
  Faction: {
    totalWins: async faction => {
      const matchRepo = getRepository(Match);
      const wins = await matchRepo
        .createQueryBuilder('match')
        .innerJoinAndSelect('match.winner', 'winner')
        .where('winner."factionId" = :factionId', { factionId: faction.id })
        .getCount();
      return wins;
    },
    totalMatches: async faction => {
      const playerMatchResultRepo = getRepository(PlayerMatchResult);
      const matches = await playerMatchResultRepo
        .createQueryBuilder('result')
        .where('result."factionId" = :factionId', {
          factionId: faction.id
        })
        .getCount();
      return matches;
    }
  }
};
