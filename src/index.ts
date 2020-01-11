import * as Discord from 'discord.js';

import { BOT_TOKEN } from './common/config';
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.SCYTHE_BOT_TOKEN);
client.login(BOT_TOKEN);
