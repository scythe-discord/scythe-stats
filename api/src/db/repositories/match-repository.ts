import { EntityRepository, Repository, EntityManager } from 'typeorm';
import { rate } from 'openskill';

import { delay } from '../../common/utils';
import {
  BidGameStatus,
  PlayerMatchResultInput,
} from '../../graphql/schema/codegen/generated';
import {
  Match,
  PlayerMatchResult,
  Faction,
  PlayerMat,
  BidGame,
} from '../entities';
import BidGamePlayer from '../entities/bid-game-player';

import PlayerRepository from './player-repository';

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 1500;

const getResultsOrderedByPlace = (
  loggedMatchResults: PlayerMatchResultInput[]
) => {
  return [...loggedMatchResults].sort((a, b) => a.rank - b.rank);
};

@EntityRepository(Match)
export default class MatchRepository extends Repository<Match> {
  logMatch = async (
    numRounds: number,
    datePlayed: string,
    loggedMatchResults: PlayerMatchResultInput[],
    recordingUserId: string,
    bidGameId: number | undefined | null
  ): Promise<{ match: Match; bidGame: BidGame | null }> => {
    let match: Match | undefined;
    let numAttempts = 0;
    let bidGame = null;
    while (numAttempts < MAX_RETRIES) {
      try {
        await this.manager.transaction(
          'SERIALIZABLE',
          async (transactionalEntityManager) => {
            bidGame =
              bidGameId == null
                ? null
                : await transactionalEntityManager.findOneOrFail(
                    BidGame,
                    bidGameId
                  );

            if (bidGame) {
              bidGame.status = BidGameStatus.GameRecorded;
            }

            match = await transactionalEntityManager.save(
              await transactionalEntityManager.create(Match, {
                numRounds,
                datePlayed,
                recordingUserId,
                bidGame,
              })
            );

            match.playerMatchResults = await this.formPlayerMatchResults(
              transactionalEntityManager,
              match,
              loggedMatchResults
            );

            if (bidGame) {
              bidGame.match = match;
              await transactionalEntityManager.save(bidGame);
            }
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

    return { match, bidGame };
  };

  formPlayerMatchResults = async (
    entityManager: EntityManager,
    match: Match,
    loggedMatchResults: PlayerMatchResultInput[]
  ): Promise<PlayerMatchResult[]> => {
    const playerMatchResults: PlayerMatchResult[] = [];
    const resultsByPlace = getResultsOrderedByPlace(loggedMatchResults);

    if (match.bidGame?.ranked) {
      const newRatings = rate(
        match.bidGame.players.map((p) => {
          console.log(p.user.trueskill);
          return [p.user.trueskill];
        })
      );

      newRatings.forEach(([newRating]) => console.log(newRating));
    }

    for (let i = 0; i < resultsByPlace.length; i++) {
      const {
        displayName,
        steamId,
        faction: factionName,
        playerMat: playerMatName,
        coins,
        rank,
        bidGamePlayerId,
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
      const bidGamePlayer: BidGamePlayer | null =
        bidGamePlayerId != null
          ? await entityManager
              .getRepository(BidGamePlayer)
              .findOneOrFail(bidGamePlayerId)
          : null;

      const playerMatchResult = await entityManager.save(
        await this.manager.create(PlayerMatchResult, {
          match,
          faction,
          playerMat,
          player,
          coins,
          rank,
          bidGamePlayer,
        })
      );

      playerMatchResults.push(playerMatchResult);
    }
    return playerMatchResults;
  };
}
