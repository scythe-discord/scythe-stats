import { PlayerScore } from '../common/scythe';

const GAME_SUMMARY_IDX = 1;
const SCORES_START_IDX = 3;

const getNumRounds = (gameSummaryLog: string): number => {
  const numRoundsMatch = gameSummaryLog.match(/(?<rounds>\d+) Rounds/);
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

  try {
    const gameSummaryLog = logLines[GAME_SUMMARY_IDX];
    const playerScoreLogs = logLines.slice(SCORES_START_IDX);

    const numRounds = getNumRounds(gameSummaryLog);
    const playerScores: PlayerScore[] = [];

    playerScoreLogs.forEach(playerScoreLog => {
      const playerScore = getPlayerScore(playerScoreLog);
      playerScores.push(playerScore);
    });

    return {
      numRounds,
      playerScores
    };
  } catch (e) {
    console.error('Failed to parse game log result', e);
  }

  return null;
};
