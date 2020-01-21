import { Message } from 'discord.js';
import { request } from 'graphql-request';

import { GAME_LOG_PREFIX, GRAPHQL_SERVER_URL } from '../common/config';

import { extractGameLog } from './extract';

const LOG_MATCH_QUERY = `
  mutation logMatch($numRounds: Int!, $datePlayed: String!, $playerMatchResults: [PlayerMatchResultInput!]!)  {
    logMatch(numRounds: $numRounds, datePlayed: $datePlayed, playerMatchResults: $playerMatchResults) {
      id
    }
  }
`;

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

  try {
    const data = await request(GRAPHQL_SERVER_URL, LOG_MATCH_QUERY, {
      numRounds: playerMatchResults.numRounds,
      datePlayed: message.createdAt.toISOString(),
      playerMatchResults: playerMatchResults.playerScores
    });
    console.log(JSON.stringify(data, undefined, 2));
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
  }
};
