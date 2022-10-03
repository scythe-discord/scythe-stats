import { shuffle } from 'lodash';
import { EntityRepository, In, Repository } from 'typeorm';
import { getActivePlayer } from '../../common/utils/get-active-player';
import { Combo } from '../../common/utils/types';
import {
  BidGameSettings,
  BidGameStatus,
  QuickBidInput,
} from '../../graphql/schema/codegen/generated';

import { Bid, BidGame, BidPreset, Faction, PlayerMat, User } from '../entities';
import BidGameCombo from '../entities/bid-game-combo';
import BidGamePlayer from '../entities/bid-game-player';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 7;

@EntityRepository(BidGame)
export default class BidGameRepository extends Repository<BidGame> {
  createBidGame = async (userId: number): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        const user = await transactionalEntityManager.findOneOrFail(
          User,
          userId
        );

        const bidGamePlayer = await transactionalEntityManager.save(
          transactionalEntityManager.create(BidGamePlayer, {
            user,
            dateJoined: date,
          })
        );

        const bidPreset = await transactionalEntityManager.findOneOrFail(
          BidPreset,
          {
            where: {
              default: true,
            },
          }
        );

        bidGame = await transactionalEntityManager.save(
          transactionalEntityManager.create(BidGame, {
            createdAt: date,
            modifiedAt: date,
            players: [bidGamePlayer],
            host: bidGamePlayer,
            bidPreset,
            enabledCombos: bidPreset.bidPresetSettings
              .filter((setting) => setting.enabled)
              .map(({ faction, playerMat }) => ({
                factionId: faction.id,
                playerMatId: playerMat.id,
              })),
          })
        );
      }
    );

    if (!bidGame) {
      throw new Error(
        'Something unexpected occurred while creating a bid game'
      );
    }

    return bidGame;
  };

  joinBidGame = async (bidGameId: number, userId: number): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        const user = await transactionalEntityManager.findOneOrFail(
          User,
          userId
        );

        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        if (bidGame.status !== BidGameStatus.Created) {
          throw new Error(
            'The game you are trying to join has already started'
          );
        }

        if (bidGame.players.length >= MAX_PLAYERS) {
          throw new Error('The game you are trying to join is full');
        }

        const bidGamePlayer = await transactionalEntityManager.save(
          transactionalEntityManager.create(BidGamePlayer, {
            user,
            dateJoined: date,
          })
        );

        bidGame.modifiedAt = date;
        bidGame.players.push(bidGamePlayer);

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error(
        'Something unexpected occurred while creating a bid game'
      );
    }

    return bidGame;
  };

  updateBidGameSettings = async (
    bidGameId: number,
    userId: number,
    bidGameSettings: BidGameSettings
  ): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        if (bidGame.status !== BidGameStatus.Created) {
          throw new Error('That game has already started');
        }

        if (bidGame.host.user.id !== userId) {
          throw new Error('You must be the host to do that');
        }

        const { bidPresetId, combos, timeLimit } = bidGameSettings;

        const bidPreset =
          bidPresetId == null
            ? null
            : await transactionalEntityManager.findOneOrFail(
                BidPreset,
                bidPresetId
              );

        const factionIds = new Set(combos.map(({ factionId }) => factionId));
        const playerMatIds = new Set(
          combos.map(({ playerMatId }) => playerMatId)
        );

        const numFoundFactionIds = await transactionalEntityManager.count(
          Faction,
          {
            where: { id: In([...factionIds]) },
          }
        );

        if (numFoundFactionIds !== factionIds.size) {
          throw new Error('Invalid faction IDs');
        }

        const numFoundPlayerMatIds = await transactionalEntityManager.count(
          PlayerMat,
          {
            where: { id: In([...playerMatIds]) },
          }
        );

        if (numFoundPlayerMatIds !== playerMatIds.size) {
          throw new Error('Invalid player mat IDs');
        }

        bidGame.enabledCombos = combos;
        bidGame.bidTimeLimitSeconds = timeLimit || null;
        bidGame.bidPreset = bidPreset;
        bidGame.modifiedAt = date;

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error('Something unexpected occurred');
    }

    return bidGame;
  };

  updateQuickBidSetting = async (
    bidGameId: number,
    userId: number,
    quickBid: boolean
  ): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        if (bidGame.status !== BidGameStatus.Created) {
          throw new Error('That game has already started');
        }

        if (bidGame.host.user.id !== userId) {
          throw new Error('You must be the host to do that');
        }

        bidGame.quickBid = quickBid;
        bidGame.modifiedAt = date;

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error('Something unexpected occurred');
    }

    return bidGame;
  };

  startBidGame = async (
    bidGameId: number,
    userId: number
  ): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        if (bidGame.host.user.id !== userId) {
          throw new Error('You must be the host to do that');
        }

        if (bidGame.status !== BidGameStatus.Created) {
          throw new Error('That game has already started');
        }

        if (bidGame.players.length < MIN_PLAYERS) {
          throw new Error('Not enough players');
        }

        if (bidGame.players.length > MAX_PLAYERS) {
          throw new Error('Too many players');
        }

        const shuffledCombos = shuffle(bidGame.enabledCombos);

        const chosenCombos = assignCombos(
          bidGame.players.length,
          shuffledCombos,
          []
        );

        if (!chosenCombos) {
          throw new Error(
            'No valid assignment of faction/player mat combinations found. Try choosing more combinations'
          );
        }

        const [factions, playerMats] = await Promise.all([
          transactionalEntityManager.find(Faction),
          transactionalEntityManager.find(PlayerMat),
        ]);

        const factionMap: Record<number, Faction> = {};
        const playerMatMap: Record<number, PlayerMat> = {};

        factions.forEach((faction) => (factionMap[faction.id] = faction));
        playerMats.forEach(
          (playerMat) => (playerMatMap[playerMat.id] = playerMat)
        );

        const bidGameCombos = chosenCombos.map(({ factionId, playerMatId }) => {
          const faction = factionMap[factionId];
          const playerMat = playerMatMap[playerMatId];
          return transactionalEntityManager.create(BidGameCombo, {
            faction,
            playerMat,
            bidGame,
          });
        });

        bidGame.status = BidGameStatus.Bidding;
        bidGame.modifiedAt = date;
        bidGame.combos = bidGameCombos;

        const orders = shuffle(
          Array(bidGame.players.length)
            .fill(null)
            .map((_, idx) => idx + 1)
        );

        bidGame.players.forEach((player, idx) => {
          player.order = orders[idx];
        });

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error('Something unexpected occurred');
    }

    return bidGame;
  };

  bid = async (
    bidGameId: number,
    userId: number,
    comboId: number,
    coins: number
  ): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        const player = bidGame.players.find(
          (player) => player.user.id === userId
        );

        if (!player) {
          throw new Error('You must be in the game to bid');
        }

        const activePlayer = getActivePlayer(bidGame);

        if (!activePlayer) {
          throw new Error('An error has occurred');
        }

        if (player.id !== activePlayer.id) {
          throw new Error('It is not your turn to bid');
        }

        if (bidGame.status !== BidGameStatus.Bidding) {
          throw new Error('That game has already started');
        }

        if (player.bid) {
          throw new Error('You already have an active bid');
        }

        bidGame.status = BidGameStatus.Bidding;
        bidGame.modifiedAt = date;
        const foundCombo = bidGame.combos?.find(({ id }) => id === comboId);

        if (!foundCombo) {
          throw new Error('That combo is not in this game');
        }

        if (foundCombo.bid) {
          if (foundCombo.bid.coins >= coins) {
            throw new Error(
              `Your bid must be higher than the current bid of ${foundCombo.bid.coins}`
            );
          }

          const previousBidder = bidGame.players.find(
            (p) => p.bid?.id === foundCombo.bid?.id
          );

          await transactionalEntityManager.delete(Bid, foundCombo.bid.id);

          if (previousBidder) {
            previousBidder.bid = null;
          }
        }
        const bid = await transactionalEntityManager.save(
          transactionalEntityManager.create(Bid, {
            bidGameCombo: foundCombo,
            bidGamePlayer: player,
            coins,
            date,
          })
        );

        player.bid = bid;
        foundCombo.bid = bid;

        await transactionalEntityManager.save(player);
        await transactionalEntityManager.save(foundCombo);

        if (bidGame.combos?.every((combo) => !!combo.bid)) {
          bidGame.status = BidGameStatus.BiddingFinished;
        }

        bidGame.bidHistory.push({
          coins,
          date,
          factionId: foundCombo.faction.id,
          playerMatId: foundCombo.playerMat.id,
          playerId: player.id,
        });

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error('Something unexpected occurred');
    }

    return bidGame;
  };

  quickBid = async (
    bidGameId: number,
    userId: number,
    quickBids: Array<QuickBidInput>
  ): Promise<BidGame> => {
    let bidGame: BidGame | undefined;

    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const date = new Date();
        bidGame = await transactionalEntityManager.findOneOrFail(
          BidGame,
          bidGameId
        );

        const player = bidGame.players.find(
          (player) => player.user.id === userId
        );

        if (!player) {
          throw new Error('You must be in the game to bid');
        }

        if (!bidGame.quickBid) {
          throw new Error('That game does not have quick bids enabled');
        }

        if (bidGame.status !== BidGameStatus.Bidding) {
          throw new Error('That game has already started');
        }

        if (player.quickBids) {
          throw new Error('You already have active bids');
        }

        bidGame.status = BidGameStatus.Bidding;
        bidGame.modifiedAt = date;

        if (Object.keys(quickBids).length !== bidGame.combos?.length) {
          throw new Error('Invalid quick bid format');
        }

        const comboIdSet = new Set<number>();

        quickBids.forEach(({ comboId, bidCoins }) => {
          if (comboIdSet.has(comboId)) {
            throw new Error('Invalid quick bid format');
          }
          comboIdSet.add(comboId);
          const foundCombo = bidGame?.combos?.find(
            ({ id }) => id === Number(comboId)
          );

          if (!foundCombo) {
            throw new Error('That combo is not in this game');
          }

          if (bidCoins < 0 || bidCoins > 250) {
            throw new Error(
              'Bids must be a non-negative integer within the limit'
            );
          }
        });

        player.quickBids = quickBids;

        await transactionalEntityManager.save(player);

        if (bidGame.players?.every((player) => !!player.quickBids)) {
          const idsToPlayerObjects: Record<
            number,
            { id: number; quickBids: QuickBidInput[] }
          > = {};
          const queue = [...bidGame.players]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((player) => {
              if (!player.quickBids) {
                throw new Error('Something went wrong');
              }
              const playerObject = {
                id: player.id,
                quickBids: player.quickBids,
              };
              idsToPlayerObjects[playerObject.id] = playerObject;
              return playerObject;
            });
          const bids: Record<
            number,
            {
              playerId: number;
              bidCoins: number;
            } | null
          > = {};
          bidGame.combos.forEach((combo) => {
            bids[combo.id] = null;
          });
          while (queue.length !== 0) {
            const currentPlayer = queue.shift();
            if (!currentPlayer?.quickBids) {
              throw new Error('Something went wrong');
            }
            const chosenBid = currentPlayer.quickBids.reduce(
              (bestBidSoFar, curr) => {
                if (bestBidSoFar === null) {
                  return curr;
                }
                const currDiff =
                  curr.bidCoins - ((bids[curr.comboId]?.bidCoins ?? -1) + 1);
                const bestBidSoFarDiff =
                  bestBidSoFar.bidCoins -
                  ((bids[bestBidSoFar.comboId]?.bidCoins ?? -1) + 1);
                if (currDiff === bestBidSoFarDiff) {
                  return curr.order < bestBidSoFar.order ? curr : bestBidSoFar;
                }
                return currDiff > bestBidSoFarDiff ? curr : bestBidSoFar;
              },
              null as null | QuickBidInput
            );

            if (!chosenBid) {
              throw new Error('Something went wrong');
            }

            const prevBid = bids[chosenBid.comboId];
            if (prevBid) {
              const prevBidderId = prevBid.playerId;
              queue.push(idsToPlayerObjects[prevBidderId]);

              if (prevBid.bidCoins > 1000) {
                throw new Error('Something went wrong');
              }

              bids[chosenBid.comboId] = {
                bidCoins: prevBid.bidCoins + 1,
                playerId: currentPlayer.id,
              };
            } else {
              bids[chosenBid.comboId] = {
                bidCoins: 0,
                playerId: currentPlayer.id,
              };
            }
          }

          const createdBids = await Promise.all(
            Object.entries(bids).map(([comboId, finalBid]) => {
              if (!finalBid) {
                throw new Error('Something went wrong');
              }

              const foundCombo = bidGame?.combos?.find(
                ({ id }) => id === Number(comboId)
              );

              const foundPlayer = bidGame?.players.find(
                ({ id }) => id === finalBid.playerId
              );

              return transactionalEntityManager.save(
                transactionalEntityManager.create(Bid, {
                  bidGameCombo: foundCombo,
                  bidGamePlayer: foundPlayer,
                  coins: finalBid.bidCoins,
                  date,
                })
              );
            })
          );

          createdBids.forEach((b) => {
            const foundCombo = bidGame?.combos?.find(
              ({ id }) => id === b.bidGameCombo.id
            );

            if (foundCombo) {
              foundCombo.bid = b;
            }

            const foundPlayer = bidGame?.players.find(
              ({ id }) => id === b.bidGamePlayer.id
            );

            if (foundPlayer) {
              foundPlayer.bid = b;
            }
          });

          bidGame.status = BidGameStatus.BiddingFinished;
        }

        bidGame = await transactionalEntityManager.save(bidGame);

        return bidGame;
      }
    );

    if (!bidGame) {
      throw new Error('Something unexpected occurred');
    }

    return bidGame;
  };
}

function assignCombos(
  numPlayers: number,
  enabledCombos: Array<Combo>,
  assignments: Array<Combo>
): Array<Combo> | null {
  if (assignments.length === numPlayers) {
    return assignments;
  }

  if (enabledCombos.length === 0) {
    return null;
  }

  for (const combo of enabledCombos) {
    assignments.push(combo);
    const validCombos = enabledCombos.filter(
      (c) =>
        c.factionId !== combo.factionId && c.playerMatId !== combo.playerMatId
    );

    const foundAssignments: Array<Combo> | null = assignCombos(
      numPlayers,
      validCombos,
      assignments
    );

    if (foundAssignments) {
      return foundAssignments;
    }
    assignments.pop();
  }

  return null;
}
