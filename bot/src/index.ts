import Discord from 'discord.js';

import { BOT_TOKEN, GAME_LOG_PREFIX } from './common/config';
import { handleLogRequest } from './logger';

const client = new Discord.Client();

client.on('ready', () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  }
});

client.on('message', (message) => {
  if (message.content.startsWith(GAME_LOG_PREFIX)) {
    handleLogRequest(message);
  }
});

client.login(BOT_TOKEN);
