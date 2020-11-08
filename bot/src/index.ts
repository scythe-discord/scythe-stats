import Discord from 'discord.js';

import { BOT_TOKEN } from './common/config';

const client = new Discord.Client();

client.on('ready', () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  }
});

client.login(BOT_TOKEN);
