import { gql } from 'apollo-server-express';
import { Client, TextChannel, MessageEmbed } from 'discord.js';
import { getRepository, getManager, EntityManager } from 'typeorm';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import Schema from '../codegen';
import {
  Match,
  Player,
  PlayerMatchResult,
  Faction,
  PlayerMat,
} from '../../../db/entities';
import { fetchDiscordMe, getOrdinal, delay } from '../../../common/utils';
import { redisClient } from '../../../common/services';
import {
  BOT_TOKEN,
  GUILD_ID,
  VANILLA_LOG_CHANNEL_ID,
  SITE_URL,
} from '../../../common/config';
import DiscordBlacklist from '../../../db/entities/discord-blacklist';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 5, // 5 log requests
  duration: 30, // Every 30 seconds
  blockDuration: 3600, // If surpassed, block for an hour
  keyPrefix: 'log-match',
});

const postMatchLog = (matchId: number) => {
  const matchRepository = getRepository(Match);
  return matchRepository
    .findOneOrFail({
      where: {
        id: matchId,
      },
      relations: [
        'playerMatchResults',
        'playerMatchResults.player',
        'playerMatchResults.faction',
        'playerMatchResults.playerMat',
        'winner',
        'winner.player',
        'winner.faction',
        'winner.playerMat',
      ],
      order: {
        datePlayed: 'DESC',
      },
    })
    .then(({ winner, playerMatchResults, numRounds }) => {
      const orderedMatchResults = playerMatchResults.sort((a, b) => {
        if (a.coins < b.coins) {
          return 1;
        } else if (a.coins === b.coins && a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      });

      const client = new Client();

      client.login(BOT_TOKEN).catch((e) => {
        console.error('Failed to login while posting match log', e);
      });

      client.on('ready', () => {
        const scytheGuild = client.guilds.cache.get(GUILD_ID);

        if (!scytheGuild) {
          throw new Error(`Unable to find guild with ID ${GUILD_ID}`);
        }

        const logChannel = scytheGuild.channels.cache.get(
          VANILLA_LOG_CHANNEL_ID
        ) as TextChannel;

        if (!logChannel || logChannel.type !== 'text') {
          throw new Error(
            `Unable to find text channel with ID ${VANILLA_LOG_CHANNEL_ID}`
          );
        }

        const winnerFactionEmoji = client.emojis.cache.find(
          (emoji) => emoji.name === winner.faction.name
        );

        if (!winnerFactionEmoji) {
          throw new Error(
            `Unable to find emoji for faction ${winner.faction.name}`
          );
        }
        const description = `${
          winner.player.displayName
        } won as ${winnerFactionEmoji.toString()} ${
          winner.playerMat.name
        } in ${numRounds} ${numRounds === 1 ? 'round' : 'rounds'} with $${
          winner.coins
        } ${winner.coins === 1 ? 'coin' : 'coins'}!`;

        let matchEmbed = new MessageEmbed()
          .setColor('#05A357')
          .setTitle('Match Log')
          .setDescription(description)
          .setURL(SITE_URL)
          .setFooter('Via https://belovedpacifist.com/');

        orderedMatchResults.forEach((result, i) => {
          let fieldName = `${getOrdinal(i + 1)} place`;

          if (i === 0) {
            fieldName = ':first_place: ' + fieldName;
          } else if (i === 1) {
            fieldName = ':second_place: ' + fieldName;
          } else if (i === 2) {
            fieldName = ':third_place: ' + fieldName;
          }

          const factionEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === result.faction.name
          );

          if (!factionEmoji) {
            throw new Error(
              `Unable to find emoji for faction ${result.faction.name}`
            );
          }

          const fieldValue = `**${
            result.player.displayName
          }** - ${factionEmoji.toString()} ${result.playerMat.name} - $${
            result.coins
          }`;

          matchEmbed = matchEmbed.addField(fieldName, fieldValue);
        });

        logChannel.send(matchEmbed).catch((e) => {
          console.error('Failed to post match log to channel', e);
        });
      });
    })
    .catch((e) => {
      console.error('Failed to post match log', e);
    });
};

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 1500;

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: String!
      playerMatchResults: [PlayerMatchResultInput!]!
      shouldPostMatchLog: Boolean!
      recordingUserId: String
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
    steamId: null,
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
        steamId,
      }
    : {
        displayName,
      };

  const existingPlayer = await entityManager.findOne(Player, {
    where: playerFilter,
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
      steamId,
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
      coins,
    } = loggedMatchResults[i];

    const faction = await entityManager.findOneOrFail(Faction, {
      where: { name: factionName },
    });
    const playerMat = await entityManager.findOneOrFail(PlayerMat, {
      where: { name: playerMatName },
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
        coins,
      })
    );

    playerMatchResults.push(playerMatchResult);
  }
  return playerMatchResults;
};

const findMatchWinner = (playerMatchResults: PlayerMatchResult[]) => {
  let winner = playerMatchResults[0];
  playerMatchResults.forEach((result) => {
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
  if (numRounds <= 0) {
    throw new Error('Matches must have more than 0 rounds played');
  }

  if (numRounds > 50) {
    throw new Error('The match length exceeds the max number of rounds');
  }

  if (loggedMatchResults.length < 2 || loggedMatchResults.length > 7) {
    throw new Error('Matches must have 2-7 players');
  }

  const seenFactions: { [key: string]: boolean } = {};
  const seenPlayerMats: { [key: string]: boolean } = {};
  const seenPlayers: { [key: string]: boolean } = {};

  for (let i = 0; i < loggedMatchResults.length; i++) {
    const {
      faction: factionName,
      playerMat: playerMatName,
      displayName,
      coins,
    } = loggedMatchResults[i];

    if (coins < 0) {
      throw new Error('Coins must be valid positive integers');
    }

    if (coins > 250) {
      throw new Error(
        "One or more players' coins exceeds the max number of coins"
      );
    }

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
      {
        numRounds,
        datePlayed,
        playerMatchResults: loggedMatchResults,
        recordingUserId: loggedRecordingUserId,
        shouldPostMatchLog,
      },
      context
    ) => {
      await validateMatch(numRounds, loggedMatchResults);

      if (context.clientIp && !context.isAdmin) {
        try {
          await rateLimiter.consume(context.clientIp, 1);
        } catch (rejRes) {
          if (rejRes instanceof Error) {
            throw new Error(
              'An unknown error occurred attempting to log your match - please try again'
            );
          }

          throw new Error(
            'You are sending log requests too quickly - please try again later'
          );
        }
      }

      let recordingUserId = '';
      if (context.isAdmin && loggedRecordingUserId) {
        recordingUserId = loggedRecordingUserId;
      } else if (loggedRecordingUserId) {
        throw new Error('You are not authorized to record this match');
      } else {
        const discordMe = await fetchDiscordMe(context);

        if (!discordMe) {
          throw new Error('You must be logged in to record matches');
        }

        recordingUserId = discordMe.id;
      }

      const blacklistRepo = getRepository(DiscordBlacklist);
      const blacklistedId = await blacklistRepo.findOne({
        where: { discordId: recordingUserId },
      });
      if (blacklistedId) {
        throw new Error('Your account has been flagged for recording matches');
      }

      let match: Match | undefined;
      let playerMatchResults: PlayerMatchResult[] | undefined;

      let numAttempts = 0;
      while (numAttempts < MAX_RETRIES) {
        try {
          await getManager().transaction(
            'SERIALIZABLE',
            async (transactionalEntityManager) => {
              match = await transactionalEntityManager.save(
                await transactionalEntityManager.create(Match, {
                  numRounds,
                  datePlayed,
                  recordingUserId,
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

          if (shouldPostMatchLog) {
            // Used asynchronously to try to post the match log to the guild, so
            // as to not affect the end user
            postMatchLog(match.id);
          }

          return {
            id: match.id.toString(),
            datePlayed: match.datePlayed.toString(),
            numRounds: match.numRounds,
            playerResults: playerMatchResults.map((result) => ({
              id: result.id,
              player: result.player,
              faction: result.faction,
              playerMat: result.playerMat,
              coins: result.coins,
            })),
            winner: match.winner,
            recordingUserId,
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
    },
  },
};
