import { Message } from 'discord.js';
import { GraphQLClient } from 'graphql-request';

import { GRAPHQL_API_URL, GRAPHQL_SERVER_BASIC_AUTH } from '../common/config';

import { extractGameLog } from './extract';

const LOG_MATCH_QUERY = `
  mutation logMatch($numRounds: Int!, $datePlayed: String!, $playerMatchResults: [PlayerMatchResultInput!]!, $shouldPostMatchLog: Boolean! $recordingUserId: String!)  {
    logMatch(numRounds: $numRounds, datePlayed: $datePlayed, playerMatchResults: $playerMatchResults, shouldPostMatchLog: $shouldPostMatchLog, recordingUserId: $recordingUserId) {
      id
    }
  }
`;

export const handleLogRequest = async (message: Message): Promise<void> => {
  const playerMatchResults = extractGameLog(message.content);

  if (!playerMatchResults) {
    console.log(
      `Failed to parse match results with content ${message.content}`
    );
    return;
  }

  try {
    const gqlClient = new GraphQLClient(
      GRAPHQL_API_URL,
      GRAPHQL_SERVER_BASIC_AUTH
        ? {
            headers: {
              authorization: `Basic ${Buffer.from(
                GRAPHQL_SERVER_BASIC_AUTH
              ).toString('base64')}`,
            },
          }
        : undefined
    );
    const data = await gqlClient.request(LOG_MATCH_QUERY, {
      numRounds: playerMatchResults.numRounds,
      datePlayed: message.createdAt.toISOString(),
      playerMatchResults: playerMatchResults.playerScores,
      recordingUserId: message.author.id,
      shouldPostMatchLog: false,
    });
    console.log(JSON.stringify(data, undefined, 2));
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
  }
};
