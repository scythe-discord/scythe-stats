import { Message } from 'discord.js';

import { GAME_LOG_PREFIX } from '../common/config';

import { extractGameLog } from './extract';

export const handleLogRequest = (message: Message): void => {
  if (!message.content.startsWith(GAME_LOG_PREFIX)) {
    return;
  }

  const matchResult = extractGameLog(message.content);
};
