import { gql, IResolvers } from 'apollo-server-express';
import { Transaction } from 'sequelize';

import {
  sequelize,
  Faction,
  PlayerMat,
  Match,
  Player,
  PlayerMatchResult
} from '.././../../db';

import Schema from '../codegen';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: Int!
      playerMatchResults: [PlayerMatchResultInput!]!
    ): Match
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
  }
`;

const findPlayerForLog = async (
  displayName: string,
  steamId: string | null = null,
  transaction: Transaction
): Promise<[Player, boolean]> => {
  return Player.findOrCreate({
    where: steamId
      ? {
          steamId
        }
      : {
          displayName,
          steamId: null
        },
    defaults: {
      displayName,
      steamId
    },
    transaction
  });
};

const mergeFloatingPlayers = async (
  player: Player,
  transaction: Transaction
): Promise<void> => {
  const floatingPlayer = await Player.findOne({
    where: { displayName: player.displayName, steamId: null },
    transaction
  });
  if (!floatingPlayer) {
    return;
  }

  await PlayerMatchResult.update(
    {
      PlayerId: player.id
    },
    {
      where: {
        PlayerId: floatingPlayer.id
      },
      transaction
    }
  );

  await floatingPlayer.destroy();
};

const createPlayerMatchResults = async (
  matchId: number,
  loggedMatchResults: Schema.PlayerMatchResultInput[],
  transaction: Transaction
): Promise<Schema.PlayerMatchResult[]> => {
  const playerMatchResults: Schema.PlayerMatchResult[] = [];

  for (let i = 0; i < loggedMatchResults.length; i++) {
    const {
      displayName,
      steamId,
      faction: logFaction,
      playerMat: logPlayerMat,
      coins
    } = loggedMatchResults[i];

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

    const [player, created] = await findPlayerForLog(
      displayName,
      steamId,
      transaction
    );
    const displayNameChanged = player.displayName !== displayName;
    const shouldMergeFloatingPlayers =
      (created && steamId) || displayNameChanged;

    if (displayNameChanged) {
      player.update({
        displayName
      });
    }

    if (shouldMergeFloatingPlayers) {
      mergeFloatingPlayers(player, transaction);
    }

    await PlayerMatchResult.create(
      {
        PlayerId: player.id,
        FactionId: faction.id,
        PlayerMatId: playerMat.id,
        MatchId: matchId,
        coins
      },
      { transaction }
    );
    playerMatchResults.push({
      displayName: player.displayName,
      steamId: player.steamId,
      faction: faction,
      playerMat: playerMat,
      coins
    });
  }
  return playerMatchResults;
};

export const resolvers: IResolvers = {
  Mutation: {
    logMatch: async (
      _,
      {
        numRounds,
        datePlayed,
        playerMatchResults: loggedMatchResults
      }: Schema.MutationLogMatchArgs
    ): Promise<Schema.Mutation['logMatch'] | null> => {
      if (numRounds === 0 || loggedMatchResults.length < 2) {
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
        const playerMatchResults = await createPlayerMatchResults(
          match.id,
          loggedMatchResults,
          transaction
        );

        await transaction.commit();

        return {
          id: match.id,
          datePlayed: match.datePlayed.getTime(),
          numRounds: match.numRounds,
          playerResults: playerMatchResults
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
