import { gql, IResolvers } from 'apollo-server-express';
import { Transaction } from 'sequelize';

import {
  sequelize,
  Match,
  PlayerMatchResult,
  Faction,
  PlayerMat
} from '.././../db';

import {
  Mutation,
  MutationLogMatchArgs,
  PlayerMatchResult as PlayerMatchResultType
} from './types';
import Player from '../../db/models/player';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: Int!
      playerMatchResults: [PlayerMatchResultInput!]!
    ): Match
  }

  type Match {
    id: Int!
    datePlayed: Int!
    numRounds: Int!
    playerResults: [PlayerMatchResult!]!
  }

  type PlayerMatchResult {
    displayName: String!
    steamId: String
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
  }
`;

const findExistingPlayer = async (
  displayName: string,
  steamId?: string | null
): Promise<Player | null> => {
  if (steamId) {
    return Player.findOne({ where: { steamId } });
  }

  return Player.findOne({ where: { displayName, steamId: null } });
};

export const resolvers: IResolvers = {
  Mutation: {
    logMatch: async (
      _,
      { numRounds, datePlayed, playerMatchResults }: MutationLogMatchArgs
    ): Promise<Mutation['logMatch'] | null> => {
      if (numRounds === 0 || playerMatchResults.length < 2) {
        return null;
      }

      let transaction: Transaction | undefined;
      try {
        transaction = await sequelize.transaction();
        const match = await Match.create(
          {
            numRounds,
            datePlayed: new Date(datePlayed)
          },
          { transaction }
        );
        const createdPlayerMatchResults: PlayerMatchResultType[] = [];

        for (let i = 0; i < playerMatchResults.length; i++) {
          const {
            displayName,
            steamId,
            faction: logFaction,
            playerMat: logPlayerMat,
            coins
          } = playerMatchResults[i];

          const faction = await Faction.findOne({
            where: { name: logFaction },
            transaction
          });
          const playerMat = await PlayerMat.findOne({
            where: { name: logPlayerMat },
            transaction
          });

          if (!faction || !playerMat) {
            throw new Error(
              `Could not find faction/player mat combo ${logFaction}/${logPlayerMat}`
            );
          }

          let player = await findExistingPlayer(displayName, steamId);

          if (!player) {
            player = await Player.create(
              {
                displayName,
                steamId
              },
              { transaction }
            );
          }

          await PlayerMatchResult.create(
            {
              PlayerId: player.id,
              FactionId: faction.id,
              PlayerMatId: playerMat.id,
              MatchId: match.id,
              coins
            },
            { transaction }
          );
          createdPlayerMatchResults.push({
            displayName: player.displayName,
            steamId: player.steamId,
            faction: faction,
            playerMat: playerMat,
            coins
          });
        }

        await transaction.commit();
        return {
          id: match.id,
          datePlayed: match.datePlayed.getTime(),
          numRounds: match.numRounds,
          playerResults: createdPlayerMatchResults
        };
      } catch (error) {
        if (transaction) {
          await transaction.rollback();
        }

        console.error('Error logging match:', error);
        throw error;
      }
    }
  }
};
