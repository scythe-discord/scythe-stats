import { Client, TextChannel } from 'discord.js';

import {
  BOT_TOKEN,
  GUILD_ID,
  VANILLA_LOG_CHANNEL_ID,
  GAME_LOG_PREFIX,
} from '../common/config';
import { delay } from '../common/utils';
import { handleLogRequest } from '../logger';

// How many messages to read at a time
const REQUEST_LIMIT = 5;
const BATCH_DELAY = 1000;

const client = new Client();

const fetchAndLogMessages = async (
  channel: TextChannel,
  before: string | null
): Promise<string | null> => {
  const messages = await channel.messages.fetch({
    limit: REQUEST_LIMIT,
    before: before ? before : undefined,
  });

  if (messages.size == 0) {
    return null;
  }

  messages.forEach(async (message) => {
    if (message.content.startsWith(GAME_LOG_PREFIX)) {
      await handleLogRequest(message);
    }
  });

  const lastSeen = messages.last();
  if (!lastSeen) {
    return null;
  }

  return lastSeen.id;
};

client.on('ready', async () => {
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

  let lastSeenMessage: string | null = null;
  do {
    try {
      lastSeenMessage = await fetchAndLogMessages(logChannel, lastSeenMessage);
    } catch (error) {
      console.error('Failed to fetch log messages:', error);
      return;
    }

    await delay(BATCH_DELAY);
  } while (lastSeenMessage !== null);

  client.destroy();
});

client.login(BOT_TOKEN);
