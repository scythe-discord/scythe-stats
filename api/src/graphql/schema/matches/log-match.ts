import { gql } from 'apollo-server';
import { getRepository, getManager, EntityManager } from 'typeorm';

import Schema from '../codegen';
import {
  Match,
  Player,
  PlayerMatchResult,
  Faction,
  PlayerMat
} from '../../../db/entities';
import { delay } from '../../../common/utils';

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 1500;

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: String!
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

const mergeFloatingPlayers = async (
  entityManager: EntityManager,
  player: Player
): Promise<void> => {
  const floatingPlayer = await entityManager.findOne(Player, {
    displayName: player.displayName,
    steamId: null
  });

  if (floatingPlayer) {
    await entityManager.update(
      PlayerMatchResult,
      { player: floatingPlayer },
      { player }
    );
    await entityManager.delete(Player, { id: floatingPlayer.id });
  }
};

const findOrCreatePlayer = async (
  entityManager: EntityManager,
  displayName: string,
  steamId: string | null = null
): Promise<Player> => {
  const playerFilter = steamId
    ? {
        steamId
      }
    : {
        displayName
      };

  const existingPlayer = await entityManager.findOne(Player, {
    where: playerFilter
  });

  if (existingPlayer) {
    if (existingPlayer.displayName !== displayName) {
      existingPlayer.displayName = displayName;
      await entityManager.save(existingPlayer);
      await mergeFloatingPlayers(entityManager, existingPlayer);
    }

    return existingPlayer;
  }

  const newPlayer = await entityManager.save(
    await entityManager.create(Player, {
      displayName,
      steamId
    })
  );

  if (steamId) {
    await mergeFloatingPlayers(entityManager, newPlayer);
  }

  return newPlayer;
};

const formPlayerMatchResults = async (
  entityManager: EntityManager,
  match: Match,
  loggedMatchResults: Schema.PlayerMatchResultInput[]
): Promise<PlayerMatchResult[]> => {
  const playerMatchResults: PlayerMatchResult[] = [];
  for (let i = 0; i < loggedMatchResults.length; i++) {
    const {
      displayName,
      steamId,
      faction: factionName,
      playerMat: playerMatName,
      coins
    } = loggedMatchResults[i];

    const faction = await entityManager.findOneOrFail(Faction, {
      where: { name: factionName }
    });
    const playerMat = await entityManager.findOneOrFail(PlayerMat, {
      where: { name: playerMatName }
    });
    const player = await findOrCreatePlayer(
      entityManager,
      displayName,
      steamId
    );
    const playerMatchResult = await entityManager.save(
      await entityManager.create(PlayerMatchResult, {
        match,
        faction,
        playerMat,
        player,
        coins
      })
    );

    playerMatchResults.push(playerMatchResult);
  }
  return playerMatchResults;
};

const findMatchWinner = (playerMatchResults: PlayerMatchResult[]) => {
  let winner = playerMatchResults[0];
  playerMatchResults.forEach(result => {
    if (result.coins > winner.coins) {
      winner = result;
    }
  });

  return winner;
};

const validateMatch = async (
  numRounds: number,
  loggedMatchResults: Schema.PlayerMatchResultInput[]
): Promise<void> => {
  if (numRounds === 0) {
    throw new Error(`Match cannot be recorded with 0 rounds played`);
  }

  if (loggedMatchResults.length < 2 || loggedMatchResults.length > 7) {
    throw new Error('Match must have between 2 and 7 (inclusive) players');
  }

  const seenFactions: { [key: string]: boolean } = {};
  const seenPlayerMats: { [key: string]: boolean } = {};
  const seenPlayers: { [key: string]: boolean } = {};

  for (let i = 0; i < loggedMatchResults.length; i++) {
    const {
      faction: factionName,
      playerMat: playerMatName,
      displayName
    } = loggedMatchResults[i];

    if (
      seenFactions[factionName] ||
      seenPlayerMats[playerMatName] ||
      seenPlayers[displayName]
    ) {
      throw new Error(
        'Match cannot contain duplicate factions, player mats, or players'
      );
    }

    seenFactions[factionName] = true;
    seenPlayerMats[playerMatName] = true;
    seenPlayers[displayName] = true;

    const factionRepo = getRepository(Faction);
    const playerMatRepo = getRepository(PlayerMat);

    if ((await factionRepo.count({ where: { name: factionName } })) === 0) {
      throw new Error(`Faction with name ${factionName} not found`);
    }

    if ((await playerMatRepo.count({ where: { name: playerMatName } })) === 0) {
      throw new Error(`Player Mat with name ${playerMatName} not found`);
    }
  }
};

export const resolvers: Schema.Resolvers = {
  Mutation: {
    logMatch: async (
      _,
      { numRounds, datePlayed, playerMatchResults: loggedMatchResults }
    ) => {
      try {
        await validateMatch(numRounds, loggedMatchResults);
      } catch (error) {
        throw new Error(`Failed to log match from ${datePlayed}: ${error}`);
      }

      let match: Match | undefined;
      let playerMatchResults: PlayerMatchResult[] | undefined;

      let numAttempts = 0;
      while (numAttempts < MAX_RETRIES) {
        try {
          await getManager().transaction(
            'SERIALIZABLE',
            async transactionalEntityManager => {
              match = await transactionalEntityManager.save(
                await transactionalEntityManager.create(Match, {
                  numRounds,
                  datePlayed
                })
              );

              playerMatchResults = await formPlayerMatchResults(
                transactionalEntityManager,
                match,
                loggedMatchResults
              );

              match.winner = findMatchWinner(playerMatchResults);
              await transactionalEntityManager.save(match);
            }
          );

          if (!match || !playerMatchResults) {
            throw new Error(
              'Something unexpected occurred while logging a match'
            );
          }

          return {
            id: match.id.toString(),
            datePlayed: match.datePlayed.toString(),
            numRounds: match.numRounds,
            playerResults: playerMatchResults.map(result => ({
              player: result.player,
              faction: result.faction,
              playerMat: result.playerMat,
              coins: result.coins
            }))
          };
        } catch (error) {
          // Wait some random amount of time so quick bursts of logs
          // (e.g. from a bot script) have a less likely chance to conflict
          // again
          await delay(Math.random() * MAX_RETRY_DELAY);
          numAttempts++;

          if (numAttempts === MAX_RETRIES) {
            console.error('Failed to log match', error);
          }
        }
      }

      return null;
    }
  }
};
