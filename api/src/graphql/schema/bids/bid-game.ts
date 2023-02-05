import { gql } from 'graphql-tag';
import { getActivePlayer } from '../../../common/utils/get-active-player';
import BidGameRepository from '../../../db/repositories/bid-game-repository';
import Schema from '../codegen';
import { withFilter } from 'graphql-subscriptions';
import { MatchRepository } from '../../../db/repositories';
import { pubsub } from '../pubsub';

export const typeDef = gql`
  extend type Query {
    bidGame(bidGameId: Int!): BidGame!
  }

  extend type Subscription {
    bidGameUpdated(bidGameId: Int!): BidGame!
  }

  extend type Mutation {
    createBidGame: BidGame! # rate limit?
    joinBidGame(bidGameId: Int!): BidGame! # rate limit?
    updateBidGameSettings(bidGameId: Int!, settings: BidGameSettings!): BidGame!
    updateQuickBidSetting(bidGameId: Int!, quickBid: Boolean!): BidGame!
    updateRankedBidGameSetting(bidGameId: Int!, ranked: Boolean!): BidGame!
    startBidGame(bidGameId: Int!): BidGame!
    bid(bidGameId: Int!, comboId: Int!, coins: Int!): BidGame!
    quickBid(bidGameId: Int!, quickBids: [QuickBidInput!]!): BidGame!
  }

  enum BidGameStatus {
    CREATED
    DELETED
    BIDDING
    BIDDING_FINISHED
    GAME_RECORDED
    EXPIRED
  }

  type Bid {
    id: Int!
    coins: Int!
    bidGamePlayer: BidGamePlayer!
    date: String!
    bidGameCombo: BidGameCombo!
  }

  type BidGameCombo {
    id: Int!
    faction: Faction!
    playerMat: PlayerMat!
    bid: Bid
  }

  type BidGamePlayer {
    id: Int!
    user: User!
    dateJoined: String!
    bid: Bid
    quickBidReady: Boolean
  }

  type BidPresetSetting {
    id: Int!
    faction: Faction!
    playerMat: PlayerMat!
    enabled: Boolean!
  }

  type BidPreset {
    id: Int!
    name: String!
    bidPresetSettings: [BidPresetSetting!]!
  }

  input ComboInput {
    factionId: Int!
    playerMatId: Int!
  }

  input BidGameSettings {
    bidPresetId: Int
    combos: [ComboInput!]!
    timeLimit: Int
  }

  input QuickBidInput {
    comboId: Int!
    bidCoins: Int!
    # lower order means higher priority
    order: Int!
  }

  type ComboSetting {
    factionId: Int!
    playerMatId: Int!
  }

  type BidHistoryEntry {
    coins: Int!
    playerId: Int!
    date: String!
    factionId: Int!
    playerMatId: Int!
  }

  type BidGame {
    id: Int!
    players: [BidGamePlayer!]!
    status: BidGameStatus!
    createdAt: String!
    modifiedAt: String!
    bidTimeLimitSeconds: Int
    combos: [BidGameCombo!]
    bidPreset: BidPreset
    host: BidGamePlayer!
    enabledCombos: [ComboSetting!]
    activePlayer: BidGamePlayer
    bidHistory: [BidHistoryEntry!]!
    quickBid: Boolean!
    ranked: Boolean!
    match: Match
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    bidGame: async (_, { bidGameId }) => {
      const bidGame = await BidGameRepository.findOneByOrFail({
        id: bidGameId,
      });
      return bidGame;
    },
  },
  Mutation: {
    createBidGame: async (_, __, context) => {
      const userId = context.session?.userId;
      if (userId == null) {
        throw new Error('You must be logged in to create a bid game');
      }

      const bidGame = await BidGameRepository.createBidGame(userId);
      return bidGame;
    },
    joinBidGame: async (_, { bidGameId }, context) => {
      const userId = context.session?.userId;
      if (userId == null) {
        throw new Error('You must be logged in to join a bid game');
      }

      const bidGame = await BidGameRepository.joinBidGame(bidGameId, userId);
      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });

      return bidGame;
    },
    updateBidGameSettings: async (_, { bidGameId, settings }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to update a bid game');
      }

      const bidGame = await BidGameRepository.updateBidGameSettings(
        bidGameId,
        userId,
        settings
      );

      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
    updateQuickBidSetting: async (_, { bidGameId, quickBid }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to update a bid game');
      }

      const bidGame = await BidGameRepository.updateSetting(
        bidGameId,
        userId,
        'quickBid',
        quickBid
      );

      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
    updateRankedBidGameSetting: async (_, { bidGameId, ranked }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to update a bid game');
      }

      const bidGame = await BidGameRepository.updateSetting(
        bidGameId,
        userId,
        'ranked',
        ranked
      );

      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
    startBidGame: async (_, { bidGameId }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to start a bid game');
      }

      const bidGame = await BidGameRepository.startBidGame(bidGameId, userId);
      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
    bid: async (_, { bidGameId, coins, comboId }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to bid');
      }

      const bidGame = await BidGameRepository.bid(
        bidGameId,
        userId,
        comboId,
        coins
      );
      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
    quickBid: async (_, { bidGameId, quickBids }, context) => {
      const userId = context.session?.userId;

      if (userId == null) {
        throw new Error('You must be logged in to bid');
      }

      const bidGame = await BidGameRepository.quickBid(
        bidGameId,
        userId,
        quickBids
      );
      pubsub.publish('BID_GAME_UPDATED', { bidGameUpdated: bidGame });
      return bidGame;
    },
  },
  Subscription: {
    bidGameUpdated: {
      // @ts-expect-error https://github.com/dotansimha/graphql-code-generator/issues/7197
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator('BID_GAME_UPDATED');
        },
        (payload, variables) => {
          return payload.bidGameUpdated.id === variables.bidGameId;
        }
      ),
    },
  },
  BidGamePlayer: {
    dateJoined: (bidGamePlayer) =>
      new Date(bidGamePlayer.dateJoined).toISOString(),
    quickBidReady: (bidGamePlayer) => !!bidGamePlayer.quickBids,
  },
  BidGame: {
    createdAt: (bidGame) => {
      return new Date(bidGame.createdAt).toISOString();
    },
    modifiedAt: (bidGame) => new Date(bidGame.modifiedAt).toISOString(),
    players: (bidGame) =>
      bidGame.players.sort((a, b) => {
        if (a.order == null || b.order == null || a.order === b.order) {
          return (
            new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime()
          );
        }
        return a.order - b.order;
      }),
    activePlayer: (bidGame) => {
      if (bidGame.quickBid) {
        return null;
      }
      return getActivePlayer(bidGame) || null;
    },
    match: async (bidGame) => {
      if (!bidGame.match) {
        return null;
      }

      const match = await MatchRepository.findOneOrFail({
        where: {
          id: bidGame.match.id,
        },
        relations: [
          'playerMatchResults',
          'playerMatchResults.player',
          'playerMatchResults.faction',
          'playerMatchResults.playerMat',
        ],
      });

      return match;
    },
  },
  Bid: {
    date: (bid) => new Date(bid.date).toISOString(),
  },
};
