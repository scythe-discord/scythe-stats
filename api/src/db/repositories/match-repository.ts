import { EntityRepository, Repository, EntityManager, In } from 'typeorm';
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
import { TrueskillChange } from '../../common/utils/types';

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
    let bidGame: BidGame | null = null;

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
              if (bidGame.status !== BidGameStatus.BiddingFinished) {
                throw new Error('This game is not ready to be recorded.');
              }

              if (
                !bidGame.players
                  .map((p) => p.user.id)
                  .includes(Number(recordingUserId))
              ) {
                throw new Error(
                  'Only players in the bid game may record the match'
                );
              }

              if (bidGame.ranked) {
                const bidGamePlayersToExpire =
                  await transactionalEntityManager.find(BidGamePlayer, {
                    relations: ['bidGame'],
                    where: {
                      user: In(bidGame.players.map((p) => p.user.id)),
                      bidGame: {
                        ranked: true,
                        status: BidGameStatus.BiddingFinished,
                      },
                    },
                  });
                const bidGameIdsToExpire = new Set<number>();
                bidGamePlayersToExpire.forEach((p) => {
                  if (bidGame && p.bidGame.id === bidGame.id) {
                    return;
                  }
                  bidGameIdsToExpire.add(p.bidGame.id);
                });

                await transactionalEntityManager.update(
                  BidGame,
                  {
                    id: In(Array.from(bidGameIdsToExpire)),
                  },
                  { status: BidGameStatus.Expired }
                );
              }

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

    let playerTrueskills: Record<number, TrueskillChange> | null = null;
    if (match.bidGame?.ranked) {
      const bidGamePlayerIdToResult: Record<number, PlayerMatchResultInput> =
        loggedMatchResults.reduce((acc, curr) => {
          if (curr.bidGamePlayerId != null) {
            acc[curr.bidGamePlayerId] = curr;
          }
          return acc;
        }, {} as Record<number, PlayerMatchResultInput>);
      const trueskillBeforeArr: TrueskillChange['before'][] = [];
      const newRatings = rate(
        match.bidGame.players.map((p) => {
          trueskillBeforeArr.push({
            sigma: p.user.trueskill.sigma,
            mu: p.user.trueskill.mu,
          });
          return [p.user.trueskill];
        }),
        {
          rank: match.bidGame.players.map((p) =>
            bidGamePlayerIdToResult[p.id].rank === 1 ? 1 : 2
          ),
        }
      );

      playerTrueskills = newRatings.reduce((acc, [newRating], idx) => {
        if (!match.bidGame) {
          return acc;
        }
        acc[match.bidGame.players[idx].id] = {
          before: trueskillBeforeArr[idx],
          after: newRating,
        };
        return acc;
      }, {} as Record<number, TrueskillChange>);

      await entityManager.save(
        match.bidGame.players.map((p) => {
          const newTrueskill = playerTrueskills?.[p.id];
          if (newTrueskill) {
            p.user.trueskill.sigma = newTrueskill.after.sigma;
            p.user.trueskill.mu = newTrueskill.after.mu;
          }
          return p.user.trueskill;
        })
      );
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
        this.manager.create(PlayerMatchResult, {
          match,
          faction,
          playerMat,
          player,
          coins,
          rank,
          bidGamePlayer,
          playerTrueskill:
            bidGamePlayerId == null || playerTrueskills == null
              ? null
              : playerTrueskills[bidGamePlayerId],
        })
      );

      playerMatchResults.push(playerMatchResult);
    }
    return playerMatchResults;
  };
}
