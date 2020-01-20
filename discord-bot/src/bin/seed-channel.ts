import Discord, { TextChannel } from 'discord.js';

import {
  BOT_TOKEN,
  GUILD_ID,
  VANILLA_LOG_CHANNEL_ID,
  GAME_LOG_PREFIX
} from '../common/config';
import { handleLogRequest } from '../logger';

// How many messages to read at a time
const REQUEST_LIMIT = 50;

const client = new Discord.Client();

const fetchAndLogMessages = async (
  channel: TextChannel,
  after: string | null
): Promise<string | null> => {
  const messages = await channel.fetchMessages({
    limit: REQUEST_LIMIT,
    after: after ? after : undefined
  });

  let lastMessage: Discord.Message | undefined;
  messages.forEach(message => {
    if (message.content.startsWith(GAME_LOG_PREFIX)) {
      handleLogRequest(message);
    }

    if (
      !lastMessage ||
      lastMessage.createdTimestamp < message.createdTimestamp
    ) {
      lastMessage = message;
    }
  });

  return lastMessage ? lastMessage.id : null;
};

client.on('ready', async () => {
  const scytheGuild = client.guilds.get(GUILD_ID);

  if (!scytheGuild) {
    throw new Error(`Unable to find guild with ID ${GUILD_ID}`);
  }

  const logChannel = scytheGuild.channels.get(
    VANILLA_LOG_CHANNEL_ID
  ) as TextChannel;

  if (!logChannel || logChannel.type !== 'text') {
    throw new Error(
      `Unable to find text channel with ID ${VANILLA_LOG_CHANNEL_ID}`
    );
  }

  let lastSeenMessage: string | null = null;
  do {
    lastSeenMessage = await fetchAndLogMessages(logChannel, lastSeenMessage);
  } while (lastSeenMessage !== null);
});

client.login(BOT_TOKEN);
