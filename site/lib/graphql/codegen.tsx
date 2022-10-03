import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Bid = {
  __typename?: 'Bid';
  bidGameCombo: BidGameCombo;
  bidGamePlayer: BidGamePlayer;
  coins: Scalars['Int'];
  date: Scalars['String'];
  id: Scalars['Int'];
};

export type BidGame = {
  __typename?: 'BidGame';
  activePlayer?: Maybe<BidGamePlayer>;
  bidHistory: Array<BidHistoryEntry>;
  bidPreset?: Maybe<BidPreset>;
  bidTimeLimitSeconds?: Maybe<Scalars['Int']>;
  combos?: Maybe<Array<BidGameCombo>>;
  createdAt: Scalars['String'];
  enabledCombos?: Maybe<Array<ComboSetting>>;
  host: BidGamePlayer;
  id: Scalars['Int'];
  match?: Maybe<Match>;
  modifiedAt: Scalars['String'];
  players: Array<BidGamePlayer>;
  quickBid: Scalars['Boolean'];
  ranked: Scalars['Boolean'];
  status: BidGameStatus;
};

export type BidGameCombo = {
  __typename?: 'BidGameCombo';
  bid?: Maybe<Bid>;
  faction: Faction;
  id: Scalars['Int'];
  playerMat: PlayerMat;
};

export type BidGamePlayer = {
  __typename?: 'BidGamePlayer';
  bid?: Maybe<Bid>;
  dateJoined: Scalars['String'];
  id: Scalars['Int'];
  quickBidReady?: Maybe<Scalars['Boolean']>;
  user: User;
};

export type BidGameSettings = {
  bidPresetId?: InputMaybe<Scalars['Int']>;
  combos: Array<ComboInput>;
  timeLimit?: InputMaybe<Scalars['Int']>;
};

export enum BidGameStatus {
  Bidding = 'BIDDING',
  BiddingFinished = 'BIDDING_FINISHED',
  Created = 'CREATED',
  Deleted = 'DELETED',
  Expired = 'EXPIRED',
  GameRecorded = 'GAME_RECORDED'
}

export type BidHistoryEntry = {
  __typename?: 'BidHistoryEntry';
  coins: Scalars['Int'];
  date: Scalars['String'];
  factionId: Scalars['Int'];
  playerId: Scalars['Int'];
  playerMatId: Scalars['Int'];
};

export type BidPreset = {
  __typename?: 'BidPreset';
  bidPresetSettings: Array<BidPresetSetting>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type BidPresetSetting = {
  __typename?: 'BidPresetSetting';
  enabled: Scalars['Boolean'];
  faction: Faction;
  id: Scalars['Int'];
  playerMat: PlayerMat;
};

export type ComboInput = {
  factionId: Scalars['Int'];
  playerMatId: Scalars['Int'];
};

export type ComboSetting = {
  __typename?: 'ComboSetting';
  factionId: Scalars['Int'];
  playerMatId: Scalars['Int'];
};

export type Faction = {
  __typename?: 'Faction';
  factionMatCombos: Array<FactionMatCombo>;
  id: Scalars['Int'];
  name: Scalars['String'];
  position: Scalars['Int'];
  statsByPlayerCount: Array<FactionStatsWithPlayerCount>;
  topPlayers: Array<PlayerFactionStats>;
  totalMatches: Scalars['Int'];
  totalWins: Scalars['Int'];
};


export type FactionTopPlayersArgs = {
  first: Scalars['Int'];
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionTotalMatchesArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionTotalWinsArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};

export type FactionMatCombo = {
  __typename?: 'FactionMatCombo';
  avgCoinsOnWin: Scalars['Int'];
  avgRoundsOnWin: Scalars['Float'];
  faction: Faction;
  leastRoundsForWin: Scalars['Int'];
  playerMat: PlayerMat;
  statsByPlayerCount: Array<FactionMatComboStatsWithPlayerCount>;
  tier: Tier;
  topPlayers: Array<PlayerFactionStats>;
  totalMatches: Scalars['Int'];
  totalWins: Scalars['Int'];
};


export type FactionMatComboAvgCoinsOnWinArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionMatComboAvgRoundsOnWinArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionMatComboLeastRoundsForWinArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionMatComboTopPlayersArgs = {
  first: Scalars['Int'];
};


export type FactionMatComboTotalMatchesArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};


export type FactionMatComboTotalWinsArgs = {
  playerCounts?: InputMaybe<Array<Scalars['Int']>>;
};

export type FactionMatComboStatsWithPlayerCount = {
  __typename?: 'FactionMatComboStatsWithPlayerCount';
  avgCoinsOnWin: Scalars['Float'];
  avgRoundsOnWin: Scalars['Float'];
  leastRoundsForWin?: Maybe<Scalars['Int']>;
  playerCount: Scalars['Int'];
  totalMatches: Scalars['Int'];
  totalWins: Scalars['Int'];
};

export type FactionStatsWithPlayerCount = {
  __typename?: 'FactionStatsWithPlayerCount';
  playerCount: Scalars['Int'];
  totalMatches: Scalars['Int'];
  totalWins: Scalars['Int'];
};

export type Match = Node & {
  __typename?: 'Match';
  datePlayed: Scalars['String'];
  id: Scalars['ID'];
  numRounds: Scalars['Int'];
  playerMatchResults: Array<PlayerMatchResult>;
  winner: PlayerMatchResult;
};

export type MatchConnection = {
  __typename?: 'MatchConnection';
  edges: Array<MatchEdge>;
  pageInfo: PageInfo;
};

export type MatchEdge = {
  __typename?: 'MatchEdge';
  cursor: Scalars['String'];
  node: Match;
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']>;
  bid: BidGame;
  createBidGame: BidGame;
  joinBidGame: BidGame;
  logMatch?: Maybe<Match>;
  quickBid: BidGame;
  startBidGame: BidGame;
  updateBidGameSettings: BidGame;
  updateQuickBidSetting: BidGame;
  updateRankedBidGameSetting: BidGame;
};


export type MutationBidArgs = {
  bidGameId: Scalars['Int'];
  coins: Scalars['Int'];
  comboId: Scalars['Int'];
};


export type MutationJoinBidGameArgs = {
  bidGameId: Scalars['Int'];
};


export type MutationLogMatchArgs = {
  bidGameId?: InputMaybe<Scalars['Int']>;
  datePlayed: Scalars['String'];
  numRounds: Scalars['Int'];
  playerMatchResults: Array<PlayerMatchResultInput>;
  recordingUserId?: InputMaybe<Scalars['String']>;
  shouldPostMatchLog: Scalars['Boolean'];
};


export type MutationQuickBidArgs = {
  bidGameId: Scalars['Int'];
  quickBids: Array<QuickBidInput>;
};


export type MutationStartBidGameArgs = {
  bidGameId: Scalars['Int'];
};


export type MutationUpdateBidGameSettingsArgs = {
  bidGameId: Scalars['Int'];
  settings: BidGameSettings;
};


export type MutationUpdateQuickBidSettingArgs = {
  bidGameId: Scalars['Int'];
  quickBid: Scalars['Boolean'];
};


export type MutationUpdateRankedBidGameSettingArgs = {
  bidGameId: Scalars['Int'];
  ranked: Scalars['Boolean'];
};

export type Node = {
  id: Scalars['ID'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor?: Maybe<Scalars['String']>;
};

export type Player = Node & {
  __typename?: 'Player';
  displayName: Scalars['String'];
  id: Scalars['ID'];
  steamId?: Maybe<Scalars['String']>;
  totalMatches: Scalars['Int'];
  totalWins: Scalars['Int'];
};


export type PlayerTotalMatchesArgs = {
  factionId?: InputMaybe<Scalars['Int']>;
  fromDate?: InputMaybe<Scalars['String']>;
};


export type PlayerTotalWinsArgs = {
  factionId?: InputMaybe<Scalars['Int']>;
  fromDate?: InputMaybe<Scalars['String']>;
};

export type PlayerConnection = {
  __typename?: 'PlayerConnection';
  edges: Array<PlayerEdge>;
  pageInfo: PageInfo;
};

export type PlayerEdge = {
  __typename?: 'PlayerEdge';
  cursor: Scalars['String'];
  node: Player;
};

export type PlayerFactionStats = {
  __typename?: 'PlayerFactionStats';
  player: Player;
  totalWins: Scalars['Int'];
};

export type PlayerMat = {
  __typename?: 'PlayerMat';
  abbrev: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  order: Scalars['Int'];
};

export type PlayerMatchResult = {
  __typename?: 'PlayerMatchResult';
  bidGamePlayer?: Maybe<BidGamePlayer>;
  coins: Scalars['Int'];
  faction: Faction;
  id: Scalars['Int'];
  player: Player;
  playerMat: PlayerMat;
  playerTrueskill?: Maybe<PlayerTrueskill>;
  rank: Scalars['Int'];
};

export type PlayerMatchResultInput = {
  bidGamePlayerId?: InputMaybe<Scalars['Int']>;
  coins: Scalars['Int'];
  displayName: Scalars['String'];
  faction: Scalars['String'];
  playerMat: Scalars['String'];
  rank: Scalars['Int'];
  steamId?: InputMaybe<Scalars['String']>;
};

export type PlayerTrueskill = {
  __typename?: 'PlayerTrueskill';
  after: Trueskill;
  before: Trueskill;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  bidGame: BidGame;
  bidPresets: Array<BidPreset>;
  faction: Faction;
  factions: Array<Faction>;
  matches: MatchConnection;
  me?: Maybe<User>;
  player?: Maybe<Player>;
  playerMat: PlayerMat;
  playerMats: Array<PlayerMat>;
  playersByName: PlayerConnection;
  playersByWins: PlayerConnection;
  tiers: Array<Tier>;
};


export type QueryBidGameArgs = {
  bidGameId: Scalars['Int'];
};


export type QueryFactionArgs = {
  id: Scalars['Int'];
};


export type QueryMatchesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
};


export type QueryPlayerArgs = {
  id: Scalars['ID'];
};


export type QueryPlayerMatArgs = {
  id: Scalars['Int'];
};


export type QueryPlayersByNameArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  startsWith: Scalars['String'];
};


export type QueryPlayersByWinsArgs = {
  after?: InputMaybe<Scalars['String']>;
  factionId?: InputMaybe<Scalars['Int']>;
  first: Scalars['Int'];
  fromDate?: InputMaybe<Scalars['String']>;
};

export type QuickBidInput = {
  bidCoins: Scalars['Int'];
  comboId: Scalars['Int'];
  order: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']>;
  bidGameUpdated: BidGame;
};


export type SubscriptionBidGameUpdatedArgs = {
  bidGameId: Scalars['Int'];
};

export type Tier = {
  __typename?: 'Tier';
  factionMatCombos: Array<FactionMatCombo>;
  id: Scalars['Int'];
  name: Scalars['String'];
  rank: Scalars['Int'];
};

export type Trueskill = {
  __typename?: 'Trueskill';
  mu: Scalars['Float'];
  sigma: Scalars['Float'];
};

export type User = {
  __typename?: 'User';
  discordId: Scalars['String'];
  discriminator: Scalars['String'];
  id: Scalars['Int'];
  username: Scalars['String'];
};

export type BidGameFragment = { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null };

export type PlayerMatchResultFragment = { __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null };

export type BidMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
  comboId: Scalars['Int'];
  coins: Scalars['Int'];
}>;


export type BidMutation = { __typename?: 'Mutation', bid: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type CreateBidGameMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateBidGameMutation = { __typename?: 'Mutation', createBidGame: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type EditBidGameSettingsMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
  settings: BidGameSettings;
}>;


export type EditBidGameSettingsMutation = { __typename?: 'Mutation', updateBidGameSettings: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type JoinBidGameMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
}>;


export type JoinBidGameMutation = { __typename?: 'Mutation', joinBidGame: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type LogMatchMutationVariables = Exact<{
  numRounds: Scalars['Int'];
  datePlayed: Scalars['String'];
  playerMatchResults: Array<PlayerMatchResultInput> | PlayerMatchResultInput;
  shouldPostMatchLog: Scalars['Boolean'];
  bidGameId?: InputMaybe<Scalars['Int']>;
}>;


export type LogMatchMutation = { __typename?: 'Mutation', logMatch?: { __typename?: 'Match', id: string, datePlayed: string, numRounds: number, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }>, winner: { __typename?: 'PlayerMatchResult', id: number } } | null };

export type QuickBidMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
  quickBids: Array<QuickBidInput> | QuickBidInput;
}>;


export type QuickBidMutation = { __typename?: 'Mutation', quickBid: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type StartBidGameMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
}>;


export type StartBidGameMutation = { __typename?: 'Mutation', startBidGame: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type UpdateQuickBidSettingMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
  quickBid: Scalars['Boolean'];
}>;


export type UpdateQuickBidSettingMutation = { __typename?: 'Mutation', updateQuickBidSetting: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type UpdateRankedBidGameSettingMutationVariables = Exact<{
  bidGameId: Scalars['Int'];
  ranked: Scalars['Boolean'];
}>;


export type UpdateRankedBidGameSettingMutation = { __typename?: 'Mutation', updateRankedBidGameSetting: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type BidGameQueryVariables = Exact<{
  bidGameId: Scalars['Int'];
}>;


export type BidGameQuery = { __typename?: 'Query', bidGame: { __typename?: 'BidGame', id: number, status: BidGameStatus, createdAt: string, modifiedAt: string, bidTimeLimitSeconds?: number | null, quickBid: boolean, ranked: boolean, players: Array<{ __typename?: 'BidGamePlayer', id: number, quickBidReady?: boolean | null, user: { __typename?: 'User', id: number, username: string }, bid?: { __typename?: 'Bid', id: number } | null }>, host: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } }, bidPreset?: { __typename?: 'BidPreset', id: number, name: string } | null, enabledCombos?: Array<{ __typename?: 'ComboSetting', factionId: number, playerMatId: number }> | null, activePlayer?: { __typename?: 'BidGamePlayer', id: number, user: { __typename?: 'User', id: number, username: string } } | null, combos?: Array<{ __typename?: 'BidGameCombo', id: number, faction: { __typename?: 'Faction', id: number, name: string, position: number }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, order: number }, bid?: { __typename?: 'Bid', id: number, coins: number } | null }> | null, match?: { __typename?: 'Match', id: string, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }> } | null } };

export type BidPresetsQueryVariables = Exact<{ [key: string]: never; }>;


export type BidPresetsQuery = { __typename?: 'Query', bidPresets: Array<{ __typename?: 'BidPreset', id: number, name: string, bidPresetSettings: Array<{ __typename?: 'BidPresetSetting', id: number, enabled: boolean, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string } }> }> };

export type DiscordMeQueryVariables = Exact<{ [key: string]: never; }>;


export type DiscordMeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, username: string, discriminator: string, discordId: string } | null };

export type FactionStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type FactionStatsQuery = { __typename?: 'Query', factions: Array<{ __typename?: 'Faction', id: number, name: string, statsByPlayerCount: Array<{ __typename?: 'FactionStatsWithPlayerCount', playerCount: number, totalWins: number, totalMatches: number }>, factionMatCombos: Array<{ __typename?: 'FactionMatCombo', playerMat: { __typename?: 'PlayerMat', id: number, name: string }, statsByPlayerCount: Array<{ __typename?: 'FactionMatComboStatsWithPlayerCount', playerCount: number, totalWins: number, totalMatches: number, avgCoinsOnWin: number, avgRoundsOnWin: number, leastRoundsForWin?: number | null }> }> }> };

export type FactionTopPlayersQueryVariables = Exact<{
  numTopPlayers: Scalars['Int'];
  playerCounts: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type FactionTopPlayersQuery = { __typename?: 'Query', factions: Array<{ __typename?: 'Faction', id: number, topPlayers: Array<{ __typename?: 'PlayerFactionStats', totalWins: number, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null } }> }> };

export type FactionsQueryVariables = Exact<{ [key: string]: never; }>;


export type FactionsQuery = { __typename?: 'Query', factions: Array<{ __typename?: 'Faction', id: number, name: string }> };

export type MatchesQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type MatchesQuery = { __typename?: 'Query', matches: { __typename?: 'MatchConnection', edges: Array<{ __typename?: 'MatchEdge', node: { __typename?: 'Match', id: string, datePlayed: string, numRounds: number, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, rank: number, bidGamePlayer?: { __typename?: 'BidGamePlayer', id: number, bid?: { __typename?: 'Bid', id: number, coins: number } | null } | null, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string }, playerTrueskill?: { __typename?: 'PlayerTrueskill', before: { __typename?: 'Trueskill', sigma: number, mu: number }, after: { __typename?: 'Trueskill', sigma: number, mu: number } } | null }>, winner: { __typename?: 'PlayerMatchResult', id: number } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor?: string | null } } };

export type PlayerMatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlayerMatsQuery = { __typename?: 'Query', playerMats: Array<{ __typename?: 'PlayerMat', id: number, name: string, abbrev: string }> };

export type PlayersByNameQueryVariables = Exact<{
  startsWith: Scalars['String'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type PlayersByNameQuery = { __typename?: 'Query', playersByName: { __typename?: 'PlayerConnection', edges: Array<{ __typename?: 'PlayerEdge', node: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null } }> } };

export type TiersQueryVariables = Exact<{
  numTopPlayers: Scalars['Int'];
}>;


export type TiersQuery = { __typename?: 'Query', tiers: Array<{ __typename?: 'Tier', id: number, name: string, rank: number, factionMatCombos: Array<{ __typename?: 'FactionMatCombo', totalWins: number, totalMatches: number, avgCoinsOnWin: number, avgRoundsOnWin: number, leastRoundsForWin: number, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string, abbrev: string }, topPlayers: Array<{ __typename?: 'PlayerFactionStats', totalWins: number, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null } }> }> }> };

export type TopPlayersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
  fromDate?: InputMaybe<Scalars['String']>;
}>;


export type TopPlayersQuery = { __typename?: 'Query', playersByWins: { __typename?: 'PlayerConnection', edges: Array<{ __typename?: 'PlayerEdge', node: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null, totalWins: number, totalMatches: number } }> } };

export const PlayerMatchResultFragmentDoc = gql`
    fragment PlayerMatchResult on PlayerMatchResult {
  id
  bidGamePlayer {
    id
    bid {
      id
      coins
    }
  }
  player {
    id
    displayName
    steamId
  }
  faction {
    id
    name
  }
  playerMat {
    id
    name
  }
  coins
  rank
  playerTrueskill {
    before {
      sigma
      mu
    }
    after {
      sigma
      mu
    }
  }
}
    `;
export const BidGameFragmentDoc = gql`
    fragment BidGame on BidGame {
  id
  status
  createdAt
  modifiedAt
  players {
    id
    user {
      id
      username
    }
    bid {
      id
    }
    quickBidReady
  }
  host {
    id
    user {
      id
      username
    }
  }
  bidTimeLimitSeconds
  quickBid
  ranked
  bidPreset {
    id
    name
  }
  enabledCombos {
    factionId
    playerMatId
  }
  activePlayer {
    id
    user {
      id
      username
    }
  }
  combos {
    id
    faction {
      id
      name
      position
    }
    playerMat {
      id
      name
      order
    }
    bid {
      id
      coins
    }
  }
  match {
    id
    playerMatchResults {
      ...PlayerMatchResult
    }
  }
}
    ${PlayerMatchResultFragmentDoc}`;
export const BidDocument = gql`
    mutation bid($bidGameId: Int!, $comboId: Int!, $coins: Int!) {
  bid(bidGameId: $bidGameId, comboId: $comboId, coins: $coins) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type BidMutationFn = Apollo.MutationFunction<BidMutation, BidMutationVariables>;

/**
 * __useBidMutation__
 *
 * To run a mutation, you first call `useBidMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBidMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bidMutation, { data, loading, error }] = useBidMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *      comboId: // value for 'comboId'
 *      coins: // value for 'coins'
 *   },
 * });
 */
export function useBidMutation(baseOptions?: Apollo.MutationHookOptions<BidMutation, BidMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BidMutation, BidMutationVariables>(BidDocument, options);
      }
export type BidMutationHookResult = ReturnType<typeof useBidMutation>;
export type BidMutationResult = Apollo.MutationResult<BidMutation>;
export type BidMutationOptions = Apollo.BaseMutationOptions<BidMutation, BidMutationVariables>;
export const CreateBidGameDocument = gql`
    mutation createBidGame {
  createBidGame {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type CreateBidGameMutationFn = Apollo.MutationFunction<CreateBidGameMutation, CreateBidGameMutationVariables>;

/**
 * __useCreateBidGameMutation__
 *
 * To run a mutation, you first call `useCreateBidGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBidGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBidGameMutation, { data, loading, error }] = useCreateBidGameMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateBidGameMutation(baseOptions?: Apollo.MutationHookOptions<CreateBidGameMutation, CreateBidGameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBidGameMutation, CreateBidGameMutationVariables>(CreateBidGameDocument, options);
      }
export type CreateBidGameMutationHookResult = ReturnType<typeof useCreateBidGameMutation>;
export type CreateBidGameMutationResult = Apollo.MutationResult<CreateBidGameMutation>;
export type CreateBidGameMutationOptions = Apollo.BaseMutationOptions<CreateBidGameMutation, CreateBidGameMutationVariables>;
export const EditBidGameSettingsDocument = gql`
    mutation editBidGameSettings($bidGameId: Int!, $settings: BidGameSettings!) {
  updateBidGameSettings(bidGameId: $bidGameId, settings: $settings) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type EditBidGameSettingsMutationFn = Apollo.MutationFunction<EditBidGameSettingsMutation, EditBidGameSettingsMutationVariables>;

/**
 * __useEditBidGameSettingsMutation__
 *
 * To run a mutation, you first call `useEditBidGameSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditBidGameSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editBidGameSettingsMutation, { data, loading, error }] = useEditBidGameSettingsMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useEditBidGameSettingsMutation(baseOptions?: Apollo.MutationHookOptions<EditBidGameSettingsMutation, EditBidGameSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditBidGameSettingsMutation, EditBidGameSettingsMutationVariables>(EditBidGameSettingsDocument, options);
      }
export type EditBidGameSettingsMutationHookResult = ReturnType<typeof useEditBidGameSettingsMutation>;
export type EditBidGameSettingsMutationResult = Apollo.MutationResult<EditBidGameSettingsMutation>;
export type EditBidGameSettingsMutationOptions = Apollo.BaseMutationOptions<EditBidGameSettingsMutation, EditBidGameSettingsMutationVariables>;
export const JoinBidGameDocument = gql`
    mutation joinBidGame($bidGameId: Int!) {
  joinBidGame(bidGameId: $bidGameId) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type JoinBidGameMutationFn = Apollo.MutationFunction<JoinBidGameMutation, JoinBidGameMutationVariables>;

/**
 * __useJoinBidGameMutation__
 *
 * To run a mutation, you first call `useJoinBidGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinBidGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinBidGameMutation, { data, loading, error }] = useJoinBidGameMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *   },
 * });
 */
export function useJoinBidGameMutation(baseOptions?: Apollo.MutationHookOptions<JoinBidGameMutation, JoinBidGameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinBidGameMutation, JoinBidGameMutationVariables>(JoinBidGameDocument, options);
      }
export type JoinBidGameMutationHookResult = ReturnType<typeof useJoinBidGameMutation>;
export type JoinBidGameMutationResult = Apollo.MutationResult<JoinBidGameMutation>;
export type JoinBidGameMutationOptions = Apollo.BaseMutationOptions<JoinBidGameMutation, JoinBidGameMutationVariables>;
export const LogMatchDocument = gql`
    mutation logMatch($numRounds: Int!, $datePlayed: String!, $playerMatchResults: [PlayerMatchResultInput!]!, $shouldPostMatchLog: Boolean!, $bidGameId: Int) {
  logMatch(
    numRounds: $numRounds
    datePlayed: $datePlayed
    playerMatchResults: $playerMatchResults
    shouldPostMatchLog: $shouldPostMatchLog
    bidGameId: $bidGameId
  ) {
    id
    datePlayed
    numRounds
    playerMatchResults {
      ...PlayerMatchResult
    }
    winner {
      id
    }
  }
}
    ${PlayerMatchResultFragmentDoc}`;
export type LogMatchMutationFn = Apollo.MutationFunction<LogMatchMutation, LogMatchMutationVariables>;

/**
 * __useLogMatchMutation__
 *
 * To run a mutation, you first call `useLogMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logMatchMutation, { data, loading, error }] = useLogMatchMutation({
 *   variables: {
 *      numRounds: // value for 'numRounds'
 *      datePlayed: // value for 'datePlayed'
 *      playerMatchResults: // value for 'playerMatchResults'
 *      shouldPostMatchLog: // value for 'shouldPostMatchLog'
 *      bidGameId: // value for 'bidGameId'
 *   },
 * });
 */
export function useLogMatchMutation(baseOptions?: Apollo.MutationHookOptions<LogMatchMutation, LogMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogMatchMutation, LogMatchMutationVariables>(LogMatchDocument, options);
      }
export type LogMatchMutationHookResult = ReturnType<typeof useLogMatchMutation>;
export type LogMatchMutationResult = Apollo.MutationResult<LogMatchMutation>;
export type LogMatchMutationOptions = Apollo.BaseMutationOptions<LogMatchMutation, LogMatchMutationVariables>;
export const QuickBidDocument = gql`
    mutation quickBid($bidGameId: Int!, $quickBids: [QuickBidInput!]!) {
  quickBid(bidGameId: $bidGameId, quickBids: $quickBids) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type QuickBidMutationFn = Apollo.MutationFunction<QuickBidMutation, QuickBidMutationVariables>;

/**
 * __useQuickBidMutation__
 *
 * To run a mutation, you first call `useQuickBidMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useQuickBidMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [quickBidMutation, { data, loading, error }] = useQuickBidMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *      quickBids: // value for 'quickBids'
 *   },
 * });
 */
export function useQuickBidMutation(baseOptions?: Apollo.MutationHookOptions<QuickBidMutation, QuickBidMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<QuickBidMutation, QuickBidMutationVariables>(QuickBidDocument, options);
      }
export type QuickBidMutationHookResult = ReturnType<typeof useQuickBidMutation>;
export type QuickBidMutationResult = Apollo.MutationResult<QuickBidMutation>;
export type QuickBidMutationOptions = Apollo.BaseMutationOptions<QuickBidMutation, QuickBidMutationVariables>;
export const StartBidGameDocument = gql`
    mutation startBidGame($bidGameId: Int!) {
  startBidGame(bidGameId: $bidGameId) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type StartBidGameMutationFn = Apollo.MutationFunction<StartBidGameMutation, StartBidGameMutationVariables>;

/**
 * __useStartBidGameMutation__
 *
 * To run a mutation, you first call `useStartBidGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartBidGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startBidGameMutation, { data, loading, error }] = useStartBidGameMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *   },
 * });
 */
export function useStartBidGameMutation(baseOptions?: Apollo.MutationHookOptions<StartBidGameMutation, StartBidGameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartBidGameMutation, StartBidGameMutationVariables>(StartBidGameDocument, options);
      }
export type StartBidGameMutationHookResult = ReturnType<typeof useStartBidGameMutation>;
export type StartBidGameMutationResult = Apollo.MutationResult<StartBidGameMutation>;
export type StartBidGameMutationOptions = Apollo.BaseMutationOptions<StartBidGameMutation, StartBidGameMutationVariables>;
export const UpdateQuickBidSettingDocument = gql`
    mutation updateQuickBidSetting($bidGameId: Int!, $quickBid: Boolean!) {
  updateQuickBidSetting(bidGameId: $bidGameId, quickBid: $quickBid) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type UpdateQuickBidSettingMutationFn = Apollo.MutationFunction<UpdateQuickBidSettingMutation, UpdateQuickBidSettingMutationVariables>;

/**
 * __useUpdateQuickBidSettingMutation__
 *
 * To run a mutation, you first call `useUpdateQuickBidSettingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuickBidSettingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuickBidSettingMutation, { data, loading, error }] = useUpdateQuickBidSettingMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *      quickBid: // value for 'quickBid'
 *   },
 * });
 */
export function useUpdateQuickBidSettingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuickBidSettingMutation, UpdateQuickBidSettingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuickBidSettingMutation, UpdateQuickBidSettingMutationVariables>(UpdateQuickBidSettingDocument, options);
      }
export type UpdateQuickBidSettingMutationHookResult = ReturnType<typeof useUpdateQuickBidSettingMutation>;
export type UpdateQuickBidSettingMutationResult = Apollo.MutationResult<UpdateQuickBidSettingMutation>;
export type UpdateQuickBidSettingMutationOptions = Apollo.BaseMutationOptions<UpdateQuickBidSettingMutation, UpdateQuickBidSettingMutationVariables>;
export const UpdateRankedBidGameSettingDocument = gql`
    mutation updateRankedBidGameSetting($bidGameId: Int!, $ranked: Boolean!) {
  updateRankedBidGameSetting(bidGameId: $bidGameId, ranked: $ranked) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;
export type UpdateRankedBidGameSettingMutationFn = Apollo.MutationFunction<UpdateRankedBidGameSettingMutation, UpdateRankedBidGameSettingMutationVariables>;

/**
 * __useUpdateRankedBidGameSettingMutation__
 *
 * To run a mutation, you first call `useUpdateRankedBidGameSettingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRankedBidGameSettingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRankedBidGameSettingMutation, { data, loading, error }] = useUpdateRankedBidGameSettingMutation({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *      ranked: // value for 'ranked'
 *   },
 * });
 */
export function useUpdateRankedBidGameSettingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRankedBidGameSettingMutation, UpdateRankedBidGameSettingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRankedBidGameSettingMutation, UpdateRankedBidGameSettingMutationVariables>(UpdateRankedBidGameSettingDocument, options);
      }
export type UpdateRankedBidGameSettingMutationHookResult = ReturnType<typeof useUpdateRankedBidGameSettingMutation>;
export type UpdateRankedBidGameSettingMutationResult = Apollo.MutationResult<UpdateRankedBidGameSettingMutation>;
export type UpdateRankedBidGameSettingMutationOptions = Apollo.BaseMutationOptions<UpdateRankedBidGameSettingMutation, UpdateRankedBidGameSettingMutationVariables>;
export const BidGameDocument = gql`
    query bidGame($bidGameId: Int!) {
  bidGame(bidGameId: $bidGameId) {
    ...BidGame
  }
}
    ${BidGameFragmentDoc}`;

/**
 * __useBidGameQuery__
 *
 * To run a query within a React component, call `useBidGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useBidGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBidGameQuery({
 *   variables: {
 *      bidGameId: // value for 'bidGameId'
 *   },
 * });
 */
export function useBidGameQuery(baseOptions: Apollo.QueryHookOptions<BidGameQuery, BidGameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BidGameQuery, BidGameQueryVariables>(BidGameDocument, options);
      }
export function useBidGameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BidGameQuery, BidGameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BidGameQuery, BidGameQueryVariables>(BidGameDocument, options);
        }
export type BidGameQueryHookResult = ReturnType<typeof useBidGameQuery>;
export type BidGameLazyQueryHookResult = ReturnType<typeof useBidGameLazyQuery>;
export type BidGameQueryResult = Apollo.QueryResult<BidGameQuery, BidGameQueryVariables>;
export const BidPresetsDocument = gql`
    query bidPresets {
  bidPresets {
    id
    name
    bidPresetSettings {
      id
      enabled
      faction {
        id
        name
      }
      playerMat {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useBidPresetsQuery__
 *
 * To run a query within a React component, call `useBidPresetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBidPresetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBidPresetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBidPresetsQuery(baseOptions?: Apollo.QueryHookOptions<BidPresetsQuery, BidPresetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BidPresetsQuery, BidPresetsQueryVariables>(BidPresetsDocument, options);
      }
export function useBidPresetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BidPresetsQuery, BidPresetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BidPresetsQuery, BidPresetsQueryVariables>(BidPresetsDocument, options);
        }
export type BidPresetsQueryHookResult = ReturnType<typeof useBidPresetsQuery>;
export type BidPresetsLazyQueryHookResult = ReturnType<typeof useBidPresetsLazyQuery>;
export type BidPresetsQueryResult = Apollo.QueryResult<BidPresetsQuery, BidPresetsQueryVariables>;
export const DiscordMeDocument = gql`
    query discordMe {
  me {
    id
    username
    discriminator
    discordId
  }
}
    `;

/**
 * __useDiscordMeQuery__
 *
 * To run a query within a React component, call `useDiscordMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscordMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscordMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useDiscordMeQuery(baseOptions?: Apollo.QueryHookOptions<DiscordMeQuery, DiscordMeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscordMeQuery, DiscordMeQueryVariables>(DiscordMeDocument, options);
      }
export function useDiscordMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscordMeQuery, DiscordMeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscordMeQuery, DiscordMeQueryVariables>(DiscordMeDocument, options);
        }
export type DiscordMeQueryHookResult = ReturnType<typeof useDiscordMeQuery>;
export type DiscordMeLazyQueryHookResult = ReturnType<typeof useDiscordMeLazyQuery>;
export type DiscordMeQueryResult = Apollo.QueryResult<DiscordMeQuery, DiscordMeQueryVariables>;
export const FactionStatsDocument = gql`
    query factionStats {
  factions {
    id
    name
    statsByPlayerCount {
      playerCount
      totalWins
      totalMatches
    }
    factionMatCombos {
      playerMat {
        id
        name
      }
      statsByPlayerCount {
        playerCount
        totalWins
        totalMatches
        avgCoinsOnWin
        avgRoundsOnWin
        leastRoundsForWin
      }
    }
  }
}
    `;

/**
 * __useFactionStatsQuery__
 *
 * To run a query within a React component, call `useFactionStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFactionStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFactionStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFactionStatsQuery(baseOptions?: Apollo.QueryHookOptions<FactionStatsQuery, FactionStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, options);
      }
export function useFactionStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FactionStatsQuery, FactionStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, options);
        }
export type FactionStatsQueryHookResult = ReturnType<typeof useFactionStatsQuery>;
export type FactionStatsLazyQueryHookResult = ReturnType<typeof useFactionStatsLazyQuery>;
export type FactionStatsQueryResult = Apollo.QueryResult<FactionStatsQuery, FactionStatsQueryVariables>;
export const FactionTopPlayersDocument = gql`
    query factionTopPlayers($numTopPlayers: Int!, $playerCounts: [Int!]!) {
  factions {
    id
    topPlayers(first: $numTopPlayers, playerCounts: $playerCounts) {
      player {
        id
        displayName
        steamId
      }
      totalWins
    }
  }
}
    `;

/**
 * __useFactionTopPlayersQuery__
 *
 * To run a query within a React component, call `useFactionTopPlayersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFactionTopPlayersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFactionTopPlayersQuery({
 *   variables: {
 *      numTopPlayers: // value for 'numTopPlayers'
 *      playerCounts: // value for 'playerCounts'
 *   },
 * });
 */
export function useFactionTopPlayersQuery(baseOptions: Apollo.QueryHookOptions<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>(FactionTopPlayersDocument, options);
      }
export function useFactionTopPlayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>(FactionTopPlayersDocument, options);
        }
export type FactionTopPlayersQueryHookResult = ReturnType<typeof useFactionTopPlayersQuery>;
export type FactionTopPlayersLazyQueryHookResult = ReturnType<typeof useFactionTopPlayersLazyQuery>;
export type FactionTopPlayersQueryResult = Apollo.QueryResult<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>;
export const FactionsDocument = gql`
    query factions {
  factions {
    id
    name
  }
}
    `;

/**
 * __useFactionsQuery__
 *
 * To run a query within a React component, call `useFactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFactionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFactionsQuery(baseOptions?: Apollo.QueryHookOptions<FactionsQuery, FactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FactionsQuery, FactionsQueryVariables>(FactionsDocument, options);
      }
export function useFactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FactionsQuery, FactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FactionsQuery, FactionsQueryVariables>(FactionsDocument, options);
        }
export type FactionsQueryHookResult = ReturnType<typeof useFactionsQuery>;
export type FactionsLazyQueryHookResult = ReturnType<typeof useFactionsLazyQuery>;
export type FactionsQueryResult = Apollo.QueryResult<FactionsQuery, FactionsQueryVariables>;
export const MatchesDocument = gql`
    query matches($first: Int!, $after: String) {
  matches(first: $first, after: $after) {
    edges {
      node {
        id
        datePlayed
        numRounds
        playerMatchResults {
          ...PlayerMatchResult
        }
        winner {
          id
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${PlayerMatchResultFragmentDoc}`;

/**
 * __useMatchesQuery__
 *
 * To run a query within a React component, call `useMatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMatchesQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMatchesQuery(baseOptions: Apollo.QueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, options);
      }
export function useMatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, options);
        }
export type MatchesQueryHookResult = ReturnType<typeof useMatchesQuery>;
export type MatchesLazyQueryHookResult = ReturnType<typeof useMatchesLazyQuery>;
export type MatchesQueryResult = Apollo.QueryResult<MatchesQuery, MatchesQueryVariables>;
export const PlayerMatsDocument = gql`
    query playerMats {
  playerMats {
    id
    name
    abbrev
  }
}
    `;

/**
 * __usePlayerMatsQuery__
 *
 * To run a query within a React component, call `usePlayerMatsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlayerMatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlayerMatsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlayerMatsQuery(baseOptions?: Apollo.QueryHookOptions<PlayerMatsQuery, PlayerMatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlayerMatsQuery, PlayerMatsQueryVariables>(PlayerMatsDocument, options);
      }
export function usePlayerMatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlayerMatsQuery, PlayerMatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlayerMatsQuery, PlayerMatsQueryVariables>(PlayerMatsDocument, options);
        }
export type PlayerMatsQueryHookResult = ReturnType<typeof usePlayerMatsQuery>;
export type PlayerMatsLazyQueryHookResult = ReturnType<typeof usePlayerMatsLazyQuery>;
export type PlayerMatsQueryResult = Apollo.QueryResult<PlayerMatsQuery, PlayerMatsQueryVariables>;
export const PlayersByNameDocument = gql`
    query playersByName($startsWith: String!, $first: Int!, $after: String) {
  playersByName(startsWith: $startsWith, first: $first, after: $after) {
    edges {
      node {
        id
        displayName
        steamId
      }
    }
  }
}
    `;

/**
 * __usePlayersByNameQuery__
 *
 * To run a query within a React component, call `usePlayersByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlayersByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlayersByNameQuery({
 *   variables: {
 *      startsWith: // value for 'startsWith'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function usePlayersByNameQuery(baseOptions: Apollo.QueryHookOptions<PlayersByNameQuery, PlayersByNameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlayersByNameQuery, PlayersByNameQueryVariables>(PlayersByNameDocument, options);
      }
export function usePlayersByNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlayersByNameQuery, PlayersByNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlayersByNameQuery, PlayersByNameQueryVariables>(PlayersByNameDocument, options);
        }
export type PlayersByNameQueryHookResult = ReturnType<typeof usePlayersByNameQuery>;
export type PlayersByNameLazyQueryHookResult = ReturnType<typeof usePlayersByNameLazyQuery>;
export type PlayersByNameQueryResult = Apollo.QueryResult<PlayersByNameQuery, PlayersByNameQueryVariables>;
export const TiersDocument = gql`
    query tiers($numTopPlayers: Int!) {
  tiers {
    id
    name
    rank
    factionMatCombos {
      faction {
        id
        name
      }
      playerMat {
        id
        name
        abbrev
      }
      topPlayers(first: $numTopPlayers) {
        player {
          id
          displayName
          steamId
        }
        totalWins
      }
      totalWins
      totalMatches
      avgCoinsOnWin
      avgRoundsOnWin
      leastRoundsForWin
    }
  }
}
    `;

/**
 * __useTiersQuery__
 *
 * To run a query within a React component, call `useTiersQuery` and pass it any options that fit your needs.
 * When your component renders, `useTiersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTiersQuery({
 *   variables: {
 *      numTopPlayers: // value for 'numTopPlayers'
 *   },
 * });
 */
export function useTiersQuery(baseOptions: Apollo.QueryHookOptions<TiersQuery, TiersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TiersQuery, TiersQueryVariables>(TiersDocument, options);
      }
export function useTiersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TiersQuery, TiersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TiersQuery, TiersQueryVariables>(TiersDocument, options);
        }
export type TiersQueryHookResult = ReturnType<typeof useTiersQuery>;
export type TiersLazyQueryHookResult = ReturnType<typeof useTiersLazyQuery>;
export type TiersQueryResult = Apollo.QueryResult<TiersQuery, TiersQueryVariables>;
export const TopPlayersDocument = gql`
    query topPlayers($first: Int!, $after: String, $fromDate: String) {
  playersByWins(first: $first, after: $after, fromDate: $fromDate) {
    edges {
      node {
        id
        displayName
        steamId
        totalWins(fromDate: $fromDate)
        totalMatches(fromDate: $fromDate)
      }
    }
  }
}
    `;

/**
 * __useTopPlayersQuery__
 *
 * To run a query within a React component, call `useTopPlayersQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopPlayersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopPlayersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      fromDate: // value for 'fromDate'
 *   },
 * });
 */
export function useTopPlayersQuery(baseOptions: Apollo.QueryHookOptions<TopPlayersQuery, TopPlayersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, options);
      }
export function useTopPlayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopPlayersQuery, TopPlayersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, options);
        }
export type TopPlayersQueryHookResult = ReturnType<typeof useTopPlayersQuery>;
export type TopPlayersLazyQueryHookResult = ReturnType<typeof useTopPlayersLazyQuery>;
export type TopPlayersQueryResult = Apollo.QueryResult<TopPlayersQuery, TopPlayersQueryVariables>;