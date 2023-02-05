import { gql } from 'graphql-tag';
import { Equal } from 'typeorm';

import { scytheDb } from '../../../db';
import { PlayerMatchResult, Match, MatComboTier } from '../../../db/entities';
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
    totalWins: async ({ faction, playerMat }, { playerCounts }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
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
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
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
    totalMatches: async ({ faction, playerMat }, { playerCounts }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('COUNT(pmr.id)', 'totalMatches')
        .where('pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
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
    avgCoinsOnWin: async ({ faction, playerMat }, { playerCounts }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(pmr.coins)', 'avgCoins')
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
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
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

      const avgCoinsRes = (await query.getRawOne()) as {
        avgCoins: string;
      };

      return Math.floor(parseFloat(avgCoinsRes.avgCoins)) || 0;
    },
    avgRoundsOnWin: async ({ faction, playerMat }, { playerCounts }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('AVG(match."numRounds")', 'avgRounds')
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
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
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

      const avgRoundsRes = (await query.getRawOne()) as {
        avgRounds: string;
      };

      return parseFloat(avgRoundsRes.avgRounds) || 0;
    },
    leastRoundsForWin: async ({ faction, playerMat }, { playerCounts }) => {
      const pmrRepo = scytheDb.getRepository(PlayerMatchResult);
      let query = pmrRepo
        .createQueryBuilder('pmr')
        .select('MIN(match."numRounds")', 'minRounds')
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
        .where('pmr."tieOrder" = 0')
        .andWhere('pmr."factionId" = :factionId', {
          factionId: faction.id,
        })
        .andWhere('pmr."playerMatId" = :playerMatId', {
          playerMatId: playerMat.id,
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

      const minRoundsRes = (await query.getRawOne()) as {
        minRounds: string;
      };

      return Number.parseInt(minRoundsRes.minRounds) || 0;
    },
  },
};
