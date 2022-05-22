import { GraphQLResolveInfo } from 'graphql';
import { FactionModel, PlayerMatModel, PlayerModel, TierModel, MatchModel, FactionMatComboBase, FactionStatsWithPlayerCountBase, FactionMatComboStatsWithPlayerCountBase, BidPresetModel, BidPresetSettingModel } from '../../mappers';
import { Context } from '../../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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

export type DiscordUser = {
  __typename?: 'DiscordUser';
  discriminator: Scalars['String'];
  id: Scalars['String'];
  username: Scalars['String'];
};

export type Faction = {
  __typename?: 'Faction';
  factionMatCombos: Array<FactionMatCombo>;
  id: Scalars['Int'];
  name: Scalars['String'];
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
  logMatch?: Maybe<Match>;
};


export type MutationLogMatchArgs = {
  datePlayed: Scalars['String'];
  numRounds: Scalars['Int'];
  playerMatchResults: Array<PlayerMatchResultInput>;
  recordingUserId?: InputMaybe<Scalars['String']>;
  shouldPostMatchLog: Scalars['Boolean'];
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
};

export type PlayerMatchResult = {
  __typename?: 'PlayerMatchResult';
  coins: Scalars['Int'];
  faction: Faction;
  id: Scalars['Int'];
  player: Player;
  playerMat: PlayerMat;
  tieOrder: Scalars['Int'];
};

export type PlayerMatchResultInput = {
  coins: Scalars['Int'];
  displayName: Scalars['String'];
  faction: Scalars['String'];
  playerMat: Scalars['String'];
  steamId?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  bidPresets: Array<BidPreset>;
  discordMe?: Maybe<DiscordUser>;
  faction: Faction;
  factions: Array<Faction>;
  matches: MatchConnection;
  player?: Maybe<Player>;
  playerMat: PlayerMat;
  playerMats: Array<PlayerMat>;
  playersByName: PlayerConnection;
  playersByWins: PlayerConnection;
  tiers: Array<Tier>;
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

export type Tier = {
  __typename?: 'Tier';
  factionMatCombos: Array<FactionMatCombo>;
  id: Scalars['Int'];
  name: Scalars['String'];
  rank: Scalars['Int'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BidPreset: ResolverTypeWrapper<BidPresetModel>;
  BidPresetSetting: ResolverTypeWrapper<BidPresetSettingModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DiscordUser: ResolverTypeWrapper<DiscordUser>;
  Faction: ResolverTypeWrapper<FactionModel>;
  FactionMatCombo: ResolverTypeWrapper<FactionMatComboBase>;
  FactionMatComboStatsWithPlayerCount: ResolverTypeWrapper<FactionMatComboStatsWithPlayerCountBase>;
  FactionStatsWithPlayerCount: ResolverTypeWrapper<FactionStatsWithPlayerCountBase>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Match: ResolverTypeWrapper<MatchModel>;
  MatchConnection: ResolverTypeWrapper<Omit<MatchConnection, 'edges'> & { edges: Array<ResolversTypes['MatchEdge']> }>;
  MatchEdge: ResolverTypeWrapper<Omit<MatchEdge, 'node'> & { node: ResolversTypes['Match'] }>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Match'] | ResolversTypes['Player'];
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Player: ResolverTypeWrapper<PlayerModel>;
  PlayerConnection: ResolverTypeWrapper<Omit<PlayerConnection, 'edges'> & { edges: Array<ResolversTypes['PlayerEdge']> }>;
  PlayerEdge: ResolverTypeWrapper<Omit<PlayerEdge, 'node'> & { node: ResolversTypes['Player'] }>;
  PlayerFactionStats: ResolverTypeWrapper<Omit<PlayerFactionStats, 'player'> & { player: ResolversTypes['Player'] }>;
  PlayerMat: ResolverTypeWrapper<PlayerMatModel>;
  PlayerMatchResult: ResolverTypeWrapper<Omit<PlayerMatchResult, 'faction' | 'player' | 'playerMat'> & { faction: ResolversTypes['Faction'], player: ResolversTypes['Player'], playerMat: ResolversTypes['PlayerMat'] }>;
  PlayerMatchResultInput: PlayerMatchResultInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tier: ResolverTypeWrapper<TierModel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BidPreset: BidPresetModel;
  BidPresetSetting: BidPresetSettingModel;
  Boolean: Scalars['Boolean'];
  DiscordUser: DiscordUser;
  Faction: FactionModel;
  FactionMatCombo: FactionMatComboBase;
  FactionMatComboStatsWithPlayerCount: FactionMatComboStatsWithPlayerCountBase;
  FactionStatsWithPlayerCount: FactionStatsWithPlayerCountBase;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Match: MatchModel;
  MatchConnection: Omit<MatchConnection, 'edges'> & { edges: Array<ResolversParentTypes['MatchEdge']> };
  MatchEdge: Omit<MatchEdge, 'node'> & { node: ResolversParentTypes['Match'] };
  Mutation: {};
  Node: ResolversParentTypes['Match'] | ResolversParentTypes['Player'];
  PageInfo: PageInfo;
  Player: PlayerModel;
  PlayerConnection: Omit<PlayerConnection, 'edges'> & { edges: Array<ResolversParentTypes['PlayerEdge']> };
  PlayerEdge: Omit<PlayerEdge, 'node'> & { node: ResolversParentTypes['Player'] };
  PlayerFactionStats: Omit<PlayerFactionStats, 'player'> & { player: ResolversParentTypes['Player'] };
  PlayerMat: PlayerMatModel;
  PlayerMatchResult: Omit<PlayerMatchResult, 'faction' | 'player' | 'playerMat'> & { faction: ResolversParentTypes['Faction'], player: ResolversParentTypes['Player'], playerMat: ResolversParentTypes['PlayerMat'] };
  PlayerMatchResultInput: PlayerMatchResultInput;
  Query: {};
  String: Scalars['String'];
  Tier: TierModel;
}>;

export type RateLimitDirectiveArgs = {
  blockDuration?: Maybe<Scalars['Int']>;
  duration?: Maybe<Scalars['Int']>;
  keyPrefix: Scalars['String'];
  points?: Maybe<Scalars['Int']>;
};

export type RateLimitDirectiveResolver<Result, Parent, ContextType = Context, Args = RateLimitDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BidPresetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BidPreset'] = ResolversParentTypes['BidPreset']> = ResolversObject<{
  bidPresetSettings?: Resolver<Array<ResolversTypes['BidPresetSetting']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BidPresetSettingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BidPresetSetting'] = ResolversParentTypes['BidPresetSetting']> = ResolversObject<{
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DiscordUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DiscordUser'] = ResolversParentTypes['DiscordUser']> = ResolversObject<{
  discriminator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Faction'] = ResolversParentTypes['Faction']> = ResolversObject<{
  factionMatCombos?: Resolver<Array<ResolversTypes['FactionMatCombo']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statsByPlayerCount?: Resolver<Array<ResolversTypes['FactionStatsWithPlayerCount']>, ParentType, ContextType>;
  topPlayers?: Resolver<Array<ResolversTypes['PlayerFactionStats']>, ParentType, ContextType, RequireFields<FactionTopPlayersArgs, 'first'>>;
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionTotalMatchesArgs>>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionTotalWinsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FactionMatComboResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FactionMatCombo'] = ResolversParentTypes['FactionMatCombo']> = ResolversObject<{
  avgCoinsOnWin?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionMatComboAvgCoinsOnWinArgs>>;
  avgRoundsOnWin?: Resolver<ResolversTypes['Float'], ParentType, ContextType, Partial<FactionMatComboAvgRoundsOnWinArgs>>;
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>;
  leastRoundsForWin?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionMatComboLeastRoundsForWinArgs>>;
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>;
  statsByPlayerCount?: Resolver<Array<ResolversTypes['FactionMatComboStatsWithPlayerCount']>, ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['Tier'], ParentType, ContextType>;
  topPlayers?: Resolver<Array<ResolversTypes['PlayerFactionStats']>, ParentType, ContextType, RequireFields<FactionMatComboTopPlayersArgs, 'first'>>;
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionMatComboTotalMatchesArgs>>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<FactionMatComboTotalWinsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FactionMatComboStatsWithPlayerCountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FactionMatComboStatsWithPlayerCount'] = ResolversParentTypes['FactionMatComboStatsWithPlayerCount']> = ResolversObject<{
  avgCoinsOnWin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  avgRoundsOnWin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  leastRoundsForWin?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  playerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FactionStatsWithPlayerCountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FactionStatsWithPlayerCount'] = ResolversParentTypes['FactionStatsWithPlayerCount']> = ResolversObject<{
  playerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  datePlayed?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  numRounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  playerMatchResults?: Resolver<Array<ResolversTypes['PlayerMatchResult']>, ParentType, ContextType>;
  winner?: Resolver<ResolversTypes['PlayerMatchResult'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MatchConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MatchConnection'] = ResolversParentTypes['MatchConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['MatchEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MatchEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MatchEdge'] = ResolversParentTypes['MatchEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Match'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationLogMatchArgs, 'datePlayed' | 'numRounds' | 'playerMatchResults' | 'shouldPostMatchLog'>>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Match' | 'Player', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = ResolversObject<{
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  steamId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<PlayerTotalMatchesArgs>>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<PlayerTotalWinsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerConnection'] = ResolversParentTypes['PlayerConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['PlayerEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerEdge'] = ResolversParentTypes['PlayerEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerFactionStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerFactionStats'] = ResolversParentTypes['PlayerFactionStats']> = ResolversObject<{
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerMatResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerMat'] = ResolversParentTypes['PlayerMat']> = ResolversObject<{
  abbrev?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerMatchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerMatchResult'] = ResolversParentTypes['PlayerMatchResult']> = ResolversObject<{
  coins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>;
  tieOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bidPresets?: Resolver<Array<ResolversTypes['BidPreset']>, ParentType, ContextType>;
  discordMe?: Resolver<Maybe<ResolversTypes['DiscordUser']>, ParentType, ContextType>;
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType, RequireFields<QueryFactionArgs, 'id'>>;
  factions?: Resolver<Array<ResolversTypes['Faction']>, ParentType, ContextType>;
  matches?: Resolver<ResolversTypes['MatchConnection'], ParentType, ContextType, RequireFields<QueryMatchesArgs, 'first'>>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<QueryPlayerArgs, 'id'>>;
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType, RequireFields<QueryPlayerMatArgs, 'id'>>;
  playerMats?: Resolver<Array<ResolversTypes['PlayerMat']>, ParentType, ContextType>;
  playersByName?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, RequireFields<QueryPlayersByNameArgs, 'first' | 'startsWith'>>;
  playersByWins?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, RequireFields<QueryPlayersByWinsArgs, 'first'>>;
  tiers?: Resolver<Array<ResolversTypes['Tier']>, ParentType, ContextType>;
}>;

export type TierResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tier'] = ResolversParentTypes['Tier']> = ResolversObject<{
  factionMatCombos?: Resolver<Array<ResolversTypes['FactionMatCombo']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  BidPreset?: BidPresetResolvers<ContextType>;
  BidPresetSetting?: BidPresetSettingResolvers<ContextType>;
  DiscordUser?: DiscordUserResolvers<ContextType>;
  Faction?: FactionResolvers<ContextType>;
  FactionMatCombo?: FactionMatComboResolvers<ContextType>;
  FactionMatComboStatsWithPlayerCount?: FactionMatComboStatsWithPlayerCountResolvers<ContextType>;
  FactionStatsWithPlayerCount?: FactionStatsWithPlayerCountResolvers<ContextType>;
  Match?: MatchResolvers<ContextType>;
  MatchConnection?: MatchConnectionResolvers<ContextType>;
  MatchEdge?: MatchEdgeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  PlayerConnection?: PlayerConnectionResolvers<ContextType>;
  PlayerEdge?: PlayerEdgeResolvers<ContextType>;
  PlayerFactionStats?: PlayerFactionStatsResolvers<ContextType>;
  PlayerMat?: PlayerMatResolvers<ContextType>;
  PlayerMatchResult?: PlayerMatchResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Tier?: TierResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = Context> = ResolversObject<{
  rateLimit?: RateLimitDirectiveResolver<any, any, ContextType>;
}>;
