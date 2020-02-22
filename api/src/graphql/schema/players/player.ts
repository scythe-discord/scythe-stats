import { gql } from 'apollo-server';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import { getRepository, MoreThanOrEqual } from 'typeorm';

import { Match, PlayerMatchResult, Player } from '../../../db/entities';
import Schema from '../codegen';

const findPlayerMatches = async (player: Player, fromDate?: string | null) => {
  const playerMatchResultRepo = getRepository(PlayerMatchResult);
  const matchRepository = getRepository(Match);

  let relevantMatches = await playerMatchResultRepo
    .createQueryBuilder('result')
    .select('result."matchId"')
    .where('result."playerId" = :playerId', {
      playerId: player.id
    })
    .getRawMany();

  if (!relevantMatches.length) {
    return [];
  }

  relevantMatches = relevantMatches.map(({ matchId }) => matchId);

  return matchRepository.findByIds(relevantMatches, {
    where: fromDate
      ? {
          datePlayed: MoreThanOrEqual(new Date(fromDate))
        }
      : {},
    relations: ['playerMatchResults', 'playerMatchResults.player']
  });
};

const findWonMatches = (matches: Match[], player: Player) => {
  const wonMatches: Match[] = [];

  matches.forEach(match => {
    let winningResult = match.playerMatchResults[0];

    match.playerMatchResults.forEach(result => {
      if (result.coins > winningResult.coins) {
        winningResult = result;
      }
    });

    if (winningResult.player.id === player.id) {
      wonMatches.push(match);
    }
  });

  return wonMatches;
};

export const typeDef = gql`
  extend type Query {
    player(id: ID!): Player
  }

  type Player implements Node {
    id: ID!
    displayName: String!
    steamId: String
    totalWins(fromDate: String): Int!
    totalMatches(fromDate: String): Int!
  }

  type PlayerConnection {
    edges: [PlayerEdge!]!
    pageInfo: PageInfo!
  }

  type PlayerEdge {
    cursor: String!
    node: Player!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    player: async (_, { id: globalId }) => {
      const { id } = fromGlobalId(globalId);
      const playerRepo = getRepository(Player);
      const player = await playerRepo.findOne(id);
      return player || null;
    }
  },
  Player: {
    id: player => toGlobalId('Player', player.id.toString()),
    totalWins: async (player, { fromDate }) => {
      const playerMatches = await findPlayerMatches(player, fromDate);
      const wonMatches = findWonMatches(playerMatches, player);

      return wonMatches.length;
    },
    totalMatches: async (player, { fromDate }) => {
      const playerMatches = await findPlayerMatches(player, fromDate);
      return playerMatches.length;
    }
  }
};
