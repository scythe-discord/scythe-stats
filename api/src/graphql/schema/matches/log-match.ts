import { gql } from 'apollo-server-express';
import { Client, TextChannel, MessageEmbed } from 'discord.js';
import { getRepository, getCustomRepository } from 'typeorm';

import Schema from '../codegen';
import {
  Match,
  Faction,
  PlayerMat,
  DiscordBlacklist,
} from '../../../db/entities';
import { MatchRepository } from '../../../db/repositories';
import { fetchDiscordMe, getOrdinal } from '../../../common/utils';
import {
  BOT_TOKEN,
  GUILD_ID,
  VANILLA_LOG_CHANNEL_ID,
  SITE_URL,
} from '../../../common/config';
import { deleteKeysByPattern, MATCH_SENSITIVE_CACHE_PREFIX } from '../../utils';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: String!
      playerMatchResults: [PlayerMatchResultInput!]!
      shouldPostMatchLog: Boolean!
      recordingUserId: String
    ): Match @rateLimit(keyPrefix: "log-match")
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
  }
`;

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
      ],
    })
    .then(({ playerMatchResults, numRounds }) => {
      const orderedMatchResults = playerMatchResults.sort((a, b) => {
        if (a.coins < b.coins) {
          return 1;
        } else if (a.coins === b.coins && a.tieOrder > b.tieOrder) {
          return 1;
        } else {
          return -1;
        }
      });

      const winner = orderedMatchResults[0];

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
          .setFooter(`Via ${SITE_URL}`);

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

      const matchRepo = getCustomRepository(MatchRepository);
      const match = await matchRepo.logMatch(
        numRounds,
        datePlayed,
        loggedMatchResults,
        recordingUserId
      );

      deleteKeysByPattern(`${MATCH_SENSITIVE_CACHE_PREFIX}*`);

      if (shouldPostMatchLog) {
        // Used asynchronously to try to post the match log to the guild, so
        // as to not affect the end user
        postMatchLog(match.id);
      }

      return match;
    },
  },
};
