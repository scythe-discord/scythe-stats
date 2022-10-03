import { gql } from 'apollo-server-express';
import { Client, TextChannel, MessageEmbed, Intents } from 'discord.js';
import { getRepository, getCustomRepository } from 'typeorm';

import Schema from '../codegen';
import {
  Match,
  Faction,
  PlayerMat,
  DiscordBlacklist,
  PlayerMatchResult,
} from '../../../db/entities';
import { MatchRepository } from '../../../db/repositories';
import { fetchDiscordMe, getOrdinal } from '../../../common/utils';
import { BOT_TOKEN, LOG_CHANNELS, SITE_URL } from '../../../common/config';
import { deleteKeysByPattern, MATCH_SENSITIVE_CACHE_PREFIX } from '../../utils';
import BidGamePlayer from '../../../db/entities/bid-game-player';
import { pubsub } from '../pubsub';

export const typeDef = gql`
  extend type Mutation {
    logMatch(
      numRounds: Int!
      datePlayed: String!
      playerMatchResults: [PlayerMatchResultInput!]!
      shouldPostMatchLog: Boolean!
      recordingUserId: String
      bidGameId: Int
    ): Match @rateLimit(keyPrefix: "log-match")
  }

  input PlayerMatchResultInput {
    displayName: String!
    steamId: String
    faction: String!
    playerMat: String!
    coins: Int!
    bidGamePlayerId: Int
    rank: Int!
  }
`;

const generateMatchLogMessage = (
  client: Client,
  playerMatchResults: PlayerMatchResult[],
  numRounds: number
) => {
  const orderedMatchResults = playerMatchResults.sort((a, b) => {
    return a.rank - b.rank;
  });

  const winner = orderedMatchResults[0];

  const winnerFactionEmoji = client.emojis.cache.find(
    (emoji) => emoji.name === winner.faction.name
  );

  if (!winnerFactionEmoji) {
    throw new Error(`Unable to find emoji for faction ${winner.faction.name}`);
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
    .setFooter({ text: `Via ${SITE_URL}` });

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

  return matchEmbed;
};

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
      const client = new Client({
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        ],
      });

      client.login(BOT_TOKEN).catch((e) => {
        console.error('Failed to login while posting match log', e);
      });

      client.on('ready', () => {
        LOG_CHANNELS.forEach(({ guildId, channelId }) => {
          const scytheGuild = client.guilds.cache.get(guildId);

          if (!scytheGuild) {
            throw new Error(`Unable to find guild with ID ${guildId}`);
          }

          const logChannel = scytheGuild.channels.cache.get(
            channelId
          ) as TextChannel;

          if (!logChannel) {
            throw new Error(`Unable to find text channel with ID ${channelId}`);
          }

          const matchEmbed = generateMatchLogMessage(
            client,
            playerMatchResults,
            numRounds
          );

          logChannel.send({ embeds: [matchEmbed] }).catch((e) => {
            console.error('Failed to post match log to channel', e);
          });
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

  loggedMatchResults.sort((a, b) => a.rank - b.rank);
  let prevFinalScore: number | null = null;

  for (let i = 0; i < loggedMatchResults.length; i++) {
    const {
      faction: factionName,
      playerMat: playerMatName,
      displayName,
      coins,
      bidGamePlayerId,
    } = loggedMatchResults[i];

    let bid: number | null = null;

    if (bidGamePlayerId != null) {
      const bidGamePlayerRepo = getRepository(BidGamePlayer);
      const player = await bidGamePlayerRepo.findOneOrFail(bidGamePlayerId);
      bid = player.bid?.coins ?? null;
    }
    if (coins < 0) {
      throw new Error('Coins must be valid non-negative integers');
    }

    if (coins > 250) {
      throw new Error(
        "One or more players' coins exceeds the max number of coins"
      );
    }

    const finalScore = coins - (bid ?? 0);

    if (prevFinalScore != null && finalScore > prevFinalScore) {
      throw new Error('Rank and coins data do not align');
    }

    prevFinalScore = finalScore;

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
        bidGameId,
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

        recordingUserId = String(discordMe.id);
      }

      const blacklistRepo = getRepository(DiscordBlacklist);
      const blacklistedId = await blacklistRepo.findOne({
        where: { discordId: recordingUserId },
      });
      if (blacklistedId) {
        throw new Error('Your account has been flagged for recording matches');
      }

      const matchRepo = getCustomRepository(MatchRepository);
      const { match, bidGame } = await matchRepo.logMatch(
        numRounds,
        datePlayed,
        loggedMatchResults,
        recordingUserId,
        bidGameId
      );

      deleteKeysByPattern(`${MATCH_SENSITIVE_CACHE_PREFIX}*`);

      if (shouldPostMatchLog) {
        // Used asynchronously to try to post the match log to the guild, so
        // as to not affect the end user
        postMatchLog(match.id);
      }

      if (bidGame) {
        pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      }

      return match;
    },
  },
};
