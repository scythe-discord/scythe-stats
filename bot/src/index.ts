import Discord from 'discord.js';

import { BOT_TOKEN } from './common/config';
import { handleLogRequest } from './logger';

const client = new Discord.Client();

client.on('ready', () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  }
});

client.on('message', (message) => {
  if (client.user && message.mentions.has(client.user)) {
    handleLogRequest(message);
  }
});

client.login(BOT_TOKEN);
