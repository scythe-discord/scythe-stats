import { EntityRepository, Repository, EntityManager } from 'typeorm';

import { delay } from '../../common/utils';
import { Match, PlayerMatchResult, Faction, PlayerMat } from '../entities';

import PlayerRepository from './player-repository';

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 1500;

interface LoggedMatchResult {
  displayName: string;
  steamId?: string | null;
  faction: string;
  playerMat: string;
  coins: number;
}

const getResultsOrderedByPlace = (loggedMatchResults: LoggedMatchResult[]) => {
  const origIndices: { [key: string]: number } = {};
  loggedMatchResults.forEach(
    (result, i) => (origIndices[result.displayName] = i)
  );

  return [...loggedMatchResults].sort((a, b) => {
    if (a.coins < b.coins) {
      return 1;
    } else if (
      a.coins === b.coins &&
      origIndices[a.displayName] > origIndices[b.displayName]
    ) {
      return 1;
    } else {
      return -1;
    }
  });
};

@EntityRepository(Match)
export default class MatchRepository extends Repository<Match> {
  logMatch = async (
    numRounds: number,
    datePlayed: string,
    loggedMatchResults: LoggedMatchResult[],
    recordingUserId: string
  ): Promise<Match> => {
    let match: Match | undefined;
    let numAttempts = 0;
    while (numAttempts < MAX_RETRIES) {
      try {
        await this.manager.transaction(
          'SERIALIZABLE',
          async (transactionalEntityManager) => {
            match = await transactionalEntityManager.save(
              await transactionalEntityManager.create(Match, {
                numRounds,
                datePlayed,
                recordingUserId,
              })
            );

            match.playerMatchResults = await this.formPlayerMatchResults(
              transactionalEntityManager,
              match,
              loggedMatchResults
            );
          }
        );

        break;
      } catch (error) {
        // Wait some random amount of time so quick bursts of logs
        // (especially from a bot script) have a less likely chance to
        // reconflict
        await delay(Math.random() * MAX_RETRY_DELAY);
        numAttempts++;

        if (numAttempts === MAX_RETRIES) {
          console.error('Failed to log match', error);
        }
      }
    }

    if (!match) {
      throw new Error('Something unexpected occurred while logging a match');
    }

    // Because of TypeORM quirks with saving a date resulting in
    // storing only the string
    match.datePlayed = new Date(match.datePlayed);

    return match;
  };

  formPlayerMatchResults = async (
    entityManager: EntityManager,
    match: Match,
    loggedMatchResults: LoggedMatchResult[]
  ): Promise<PlayerMatchResult[]> => {
    const playerMatchResults: PlayerMatchResult[] = [];
    const resultsByPlace = getResultsOrderedByPlace(loggedMatchResults);

    let prevResult = null;
    let prevTieOrder = 0;
    for (let i = 0; i < resultsByPlace.length; i++) {
      const {
        displayName,
        steamId,
        faction: factionName,
        playerMat: playerMatName,
        coins,
      } = resultsByPlace[i];

      const faction = await entityManager.findOneOrFail(Faction, {
        where: { name: factionName },
      });
      const playerMat = await entityManager.findOneOrFail(PlayerMat, {
        where: { name: playerMatName },
      });
      const player = await entityManager
        .getCustomRepository(PlayerRepository)
        .findOrCreatePlayer(
          displayName.trim(),
          steamId ? steamId.trim() : steamId
        );
      const tieOrder =
        prevResult && prevResult.coins === coins ? prevTieOrder + 1 : 0;
      const playerMatchResult = await entityManager.save(
        await this.manager.create(PlayerMatchResult, {
          match,
          faction,
          playerMat,
          player,
          coins,
          tieOrder,
        })
      );

      playerMatchResults.push(playerMatchResult);

      prevTieOrder = tieOrder;
      prevResult = resultsByPlace[i];
    }
    return playerMatchResults;
  };
}
