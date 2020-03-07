import { Message } from 'discord.js';
import { GraphQLClient } from 'graphql-request';

import {
  GAME_LOG_PREFIX,
  GRAPHQL_SERVER_URL,
  GRAPHQL_SERVER_BASIC_AUTH
} from '../common/config';

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
    const gqlClient = new GraphQLClient(
      GRAPHQL_SERVER_URL,
      GRAPHQL_SERVER_BASIC_AUTH
        ? {
            headers: {
              authorization: `Basic ${Buffer.from(
                GRAPHQL_SERVER_BASIC_AUTH
              ).toString('base64')}`
            }
          }
        : undefined
    );
    const data = await gqlClient.request(LOG_MATCH_QUERY, {
      numRounds: playerMatchResults.numRounds,
      datePlayed: message.createdAt.toISOString(),
      playerMatchResults: playerMatchResults.playerScores
    });
    console.log(JSON.stringify(data, undefined, 2));
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
  }
};
