import { gql } from 'apollo-server';
import { connectionFromArray } from 'graphql-relay';
import { getRepository } from 'typeorm';
import { values } from 'lodash';

import { Match, Player } from '../../../db/entities';
import Schema from '../codegen';

const findPlayersOrderedByWins = async () => {
  const matchRepository = getRepository(Match);
  const matches = await matchRepository.find({
    relations: ['playerMatchResults', 'playerMatchResults.player']
  });

  const playerWinCounts: {
    [key: number]: {
      wins: number;
      player: Player;
    };
  } = {};

  matches.forEach(({ playerMatchResults }) => {
    let winningResult = playerMatchResults[0];

    playerMatchResults.forEach(result => {
      if (result.coins > winningResult.coins) {
        winningResult = result;
      }
    });

    if (playerWinCounts[winningResult.player.id]) {
      playerWinCounts[winningResult.player.id].wins++;
    } else {
      playerWinCounts[winningResult.player.id] = {
        wins: 1,
        player: winningResult.player
      };
    }
  });

  const orderedPlayers = values(playerWinCounts)
    .sort((a, b) => b.wins - a.wins)
    .map(({ player }) => player);

  return orderedPlayers;
};

export const typeDef = gql`
  extend type Query {
    playersByWins(first: Int!, after: String): PlayerConnection!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    playersByWins: async (_, args) => {
      const players = await findPlayersOrderedByWins();
      return connectionFromArray(players, args);
    }
  }
};
