import { Message } from 'discord.js';

import { GAME_LOG_PREFIX } from '../common/config';
import { PlayerScore } from '../common/scythe';

const GAME_SUMMARY_IDX = 1;
const SCORES_START_IDX = 3;

const getNumRounds = (gameSummary: string): number => {
  const numRoundsMatch = gameSummary.match(/(?<rounds>\d+) Rounds/);
  const numRounds = Number(numRoundsMatch.groups.rounds);
  return numRounds;
};

const getPlayerScore = (playerScoreLog: string): PlayerScore => {
  // Match from the end of the string due to stable formatting
  // (where the player name and Steam ID are unstable)
  const scoreLogMatch = playerScoreLog.match(
    /(?<playerDetails>.*)<:(?<faction>\w+):.*\| (?<playerMat>\w+) \| \*\*\$(?<coins>\d+)\*\*$/
  );
  const playerDetails = scoreLogMatch.groups.playerDetails.trim();

  // TODO: Once Azor adds steam IDs,
  // change to /^\*\*(?<displayName>.*)\*\* \((?<steamId>.*)\)$/
  const playerDetailsMatch = playerDetails.match(/^\*\*(?<displayName>.*)\*\*/);

  const { faction, playerMat, coins } = scoreLogMatch.groups;
  const { displayName, steamId } = playerDetailsMatch.groups;

  const score = Number(coins);

  return {
    displayName,
    steamId,
    score,
    faction,
    playerMat
  };
};

export const handleLogRequest = (message: Message): void => {
  if (!message.content.startsWith(GAME_LOG_PREFIX)) {
    return;
  }

  /* 
    One line for the log request (@Automa)
    One line for the game summary
    Empty line for aesthetics
    Each subsequent line is a player
  */
  const logLines = message.content.split('\n');

  try {
    const gameSummary = logLines[GAME_SUMMARY_IDX];
    const playerScores = logLines.slice(SCORES_START_IDX);

    const numRounds = getNumRounds(gameSummary);

    console.log('Num Rounds:', numRounds);

    playerScores.forEach(playerScoreLog => {
      const playerScore = getPlayerScore(playerScoreLog);
      console.log('Player Score:', playerScore);
    });
  } catch (e) {
    console.error('Failed to parse game log result', e);
  }
};
