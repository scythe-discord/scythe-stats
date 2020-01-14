import { PlayerScore } from '../common/scythe';

const GAME_SUMMARY_IDX = 1;
const SCORES_START_IDX = 3;

const getNumRounds = (gameSummaryLog: string): number | null => {
  const numRoundsMatch = gameSummaryLog.match(/(?<rounds>\d+) Rounds/);

  if (!numRoundsMatch || !numRoundsMatch.groups) {
    return null;
  }

  const numRounds = Number(numRoundsMatch.groups.rounds);
  return numRounds;
};

const getPlayerScore = (playerScoreLog: string): PlayerScore | null => {
  // Match from the end of the string due to stable formatting
  // (where the player name and Steam ID are unstable)
  const scoreLogMatch = playerScoreLog.match(
    /(?<playerDetails>.*)<:(?<faction>\w+):.*\| (?<playerMat>\w+) \| \*\*\$(?<coins>\d+)\*\*$/
  );

  if (!scoreLogMatch || !scoreLogMatch.groups) {
    return null;
  }

  const playerDetails = scoreLogMatch.groups.playerDetails.trim();

  // TODO: Once Azor adds steam IDs,
  // change to /^\*\*(?<displayName>.*)\*\* \((?<steamId>.*)\)$/
  const playerDetailsMatch = playerDetails.match(/^\*\*(?<displayName>.*)\*\*/);

  if (!playerDetailsMatch || !playerDetailsMatch.groups) {
    return null;
  }

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

export const extractGameLog = (
  log: string
): { numRounds: number; playerScores: PlayerScore[] } | null => {
  /* 
    One line for the log request (@Automa)
    One line for the game summary
    Empty line for aesthetics
    Each subsequent line is a player
  */
  const logLines = log.split('\n');

  const gameSummaryLog = logLines[GAME_SUMMARY_IDX];
  const playerScoreLogs = logLines.slice(SCORES_START_IDX);

  const numRounds = getNumRounds(gameSummaryLog);

  if (!numRounds) {
    return null;
  }

  const playerScores: PlayerScore[] = [];

  for (let i = 0; i < playerScoreLogs.length; i++) {
    const playerScore = getPlayerScore(playerScoreLogs[i]);

    if (!playerScore) {
      return null;
    }

    playerScores.push(playerScore);
  }

  return {
    numRounds,
    playerScores
  };
};
