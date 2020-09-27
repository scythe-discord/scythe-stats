import { gql } from 'apollo-server-express';
import { getRepository } from 'typeorm';

import {
  Faction,
  PlayerMatchResult,
  PlayerMat,
  Match,
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
    totalWins(playerCounts: [Int!]): Int!
    totalMatches(playerCounts: [Int!]): Int!
    statsByPlayerCount: [FactionStatsWithPlayerCount!]!
    factionMatCombos: [FactionMatCombo!]!
    topPlayers(first: Int!, playerCounts: [Int!]): [PlayerFactionStats!]!
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
    totalWins: async (faction, { playerCounts }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalWins')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'pmr2')
              .select('MAX(pmr2.coins)', 'maxCoins')
              .addSelect('pmr2."matchId"')
              .groupBy('pmr2."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', {
          factionId: faction.id,
        });

      if (playerCounts) {
        query = query.innerJoin(
          (qb) => {
            let subQuery = qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id');

            if (playerCounts) {
              const filteredPlayerCounts = Array.from(
                new Set(playerCounts).values()
              );
              subQuery = subQuery.having(
                'COUNT("matchPlayers".id) IN (:...playerCounts)',
                {
                  playerCounts: filteredPlayerCounts,
                }
              );
            }

            return subQuery;
          },
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        );
      }

      const totalWinsRes = (await query.getRawOne()) as {
        totalWins: string;
      };

      return Number.parseInt(totalWinsRes.totalWins) || 0;
    },
    totalMatches: async (faction, { playerCounts }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalMatches')
        .where('pmr."factionId" = :factionId', {
          factionId: faction.id,
        });

      if (playerCounts) {
        query = query.innerJoin(
          (qb) => {
            let subQuery = qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id');

            if (playerCounts) {
              const filteredPlayerCounts = Array.from(
                new Set(playerCounts).values()
              );
              subQuery = subQuery.having(
                'COUNT("matchPlayers".id) IN (:...playerCounts)',
                {
                  playerCounts: filteredPlayerCounts,
                }
              );
            }

            return subQuery;
          },
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        );
      }

      const totalMatchesRes = (await query.getRawOne()) as {
        totalMatches: string;
      };

      return Number.parseInt(totalMatchesRes.totalMatches) || 0;
    },
    factionMatCombos: async (faction) => {
      const playerMatRepo = getRepository(PlayerMat);
      const playerMats = await playerMatRepo.find();
      return playerMats.map((playerMat) => ({
        faction,
        playerMat,
      }));
    },
    topPlayers: async ({ id: factionId }, { first, playerCounts }) => {
      const pmrRepo = getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('player.*')
        .addSelect('COUNT(player.id)', 'totalWins')
        .innerJoin('pmr.player', 'player')
        .innerJoin(
          (qb) =>
            qb
              .from(PlayerMatchResult, 'pmr2')
              .select('MAX(pmr2.coins)', 'maxCoins')
              .addSelect('pmr2."matchId"')
              .groupBy('pmr2."matchId"'),
          'maxes',
          'maxes."maxCoins" = pmr.coins AND maxes."matchId" = pmr."matchId"'
        )
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', {
          factionId,
        })
        .groupBy('player.id')
        .orderBy('"totalWins"', 'DESC')
        .limit(first);

      if (playerCounts) {
        query = query.innerJoin(
          (qb) => {
            let subQuery = qb
              .from(Match, 'match')
              .select('COUNT("matchPlayers".id)', 'playerCount')
              .addSelect('match.id', 'matchId')
              .innerJoin('match.playerMatchResults', 'matchPlayers')
              .groupBy('match.id');

            if (playerCounts) {
              const filteredPlayerCounts = Array.from(
                new Set(playerCounts).values()
              );
              subQuery = subQuery.having(
                'COUNT("matchPlayers".id) IN (:...playerCounts)',
                {
                  playerCounts: filteredPlayerCounts,
                }
              );
            }

            return subQuery;
          },
          'playerCounts',
          '"playerCounts"."matchId" = pmr."matchId"'
        );
      }
      const topPlayersRes = (await query.getRawMany()) as {
        id: string;
        displayName: string;
        steamId: string | null;
        totalWins: string;
      }[];

      return topPlayersRes.map(({ totalWins, id, displayName, steamId }) => ({
        player: {
          id: Number.parseInt(id),
          displayName,
          steamId,
          playerMatchResults: [],
        },
        totalWins: Number.parseInt(totalWins) || 0,
      }));
    },
  },
};
