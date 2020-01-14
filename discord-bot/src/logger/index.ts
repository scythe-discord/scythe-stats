import { Message } from 'discord.js';

import { GAME_LOG_PREFIX } from '../common/config';

import { extractGameLog } from './extract';

export const handleLogRequest = async (message: Message): Promise<void> => {
  if (!message.content.startsWith(GAME_LOG_PREFIX)) {
    return;
  }

  const playerMatchResults = extractGameLog(message.content);

  if (!playerMatchResults) {
    console.log(
      `Failed to parse match results with content ${message.content}`
    );
    return;
  }
};
