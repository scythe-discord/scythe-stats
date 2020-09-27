import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { FactionModel, PlayerMatModel, PlayerModel, TierModel, MatchModel, FactionMatComboBase, FactionStatsWithPlayerCountBase, FactionMatComboStatsWithPlayerCountBase } from '../../mappers';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Query = {
   __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  discordMe?: Maybe<DiscordUser>;
  playerMat: PlayerMat;
  playerMats: Array<PlayerMat>;
  faction: Faction;
  factions: Array<Faction>;
  player?: Maybe<Player>;
  playersByWins: PlayerConnection;
  playersByName: PlayerConnection;
  matches: MatchConnection;
  tiers: Array<Tier>;
};


export type QueryPlayerMatArgs = {
  id: Scalars['Int'];
};


export type QueryFactionArgs = {
  id: Scalars['Int'];
};


export type QueryPlayerArgs = {
  id: Scalars['ID'];
};


export type QueryPlayersByWinsArgs = {
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
  factionId?: Maybe<Scalars['Int']>;
  fromDate?: Maybe<Scalars['String']>;
};


export type QueryPlayersByNameArgs = {
  startsWith: Scalars['String'];
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
};


export type QueryMatchesArgs = {
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
};

export type Mutation = {
   __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']>;
  logMatch?: Maybe<Match>;
};


export type MutationLogMatchArgs = {
  numRounds: Scalars['Int'];
  datePlayed: Scalars['String'];
  playerMatchResults: Array<PlayerMatchResultInput>;
  shouldPostMatchLog: Scalars['Boolean'];
  recordingUserId?: Maybe<Scalars['String']>;
};

export type Node = {
  id: Scalars['ID'];
};

export type PageInfo = {
   __typename?: 'PageInfo';
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor?: Maybe<Scalars['String']>;
  endCursor?: Maybe<Scalars['String']>;
};

export type DiscordUser = {
   __typename?: 'DiscordUser';
  id: Scalars['String'];
  username: Scalars['String'];
  discriminator: Scalars['String'];
};

export type PlayerMat = {
   __typename?: 'PlayerMat';
  id: Scalars['Int'];
  name: Scalars['String'];
  abbrev: Scalars['String'];
};

export type PlayerFactionStats = {
   __typename?: 'PlayerFactionStats';
  player: Player;
  totalWins: Scalars['Int'];
};

export type Faction = {
   __typename?: 'Faction';
  id: Scalars['Int'];
  name: Scalars['String'];
  totalWins: Scalars['Int'];
  totalMatches: Scalars['Int'];
  statsByPlayerCount: Array<FactionStatsWithPlayerCount>;
  factionMatCombos: Array<FactionMatCombo>;
  topPlayers: Array<PlayerFactionStats>;
};


export type FactionTotalWinsArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionTotalMatchesArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionTopPlayersArgs = {
  first: Scalars['Int'];
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};

export type FactionMatCombo = {
   __typename?: 'FactionMatCombo';
  faction: Faction;
  playerMat: PlayerMat;
  topPlayers: Array<PlayerFactionStats>;
  tier: Tier;
  totalWins: Scalars['Int'];
  totalMatches: Scalars['Int'];
  avgCoinsOnWin: Scalars['Int'];
  avgRoundsOnWin: Scalars['Float'];
  leastRoundsForWin: Scalars['Int'];
  statsByPlayerCount: Array<FactionMatComboStatsWithPlayerCount>;
};


export type FactionMatComboTopPlayersArgs = {
  first: Scalars['Int'];
};


export type FactionMatComboTotalWinsArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionMatComboTotalMatchesArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionMatComboAvgCoinsOnWinArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionMatComboAvgRoundsOnWinArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};


export type FactionMatComboLeastRoundsForWinArgs = {
  playerCounts?: Maybe<Array<Scalars['Int']>>;
};

export type FactionMatComboStatsWithPlayerCount = {
   __typename?: 'FactionMatComboStatsWithPlayerCount';
  playerCount: Scalars['Int'];
  totalWins: Scalars['Int'];
  totalMatches: Scalars['Int'];
  avgCoinsOnWin: Scalars['Int'];
  avgRoundsOnWin: Scalars['Float'];
  leastRoundsForWin?: Maybe<Scalars['Int']>;
};

export type FactionStatsWithPlayerCount = {
   __typename?: 'FactionStatsWithPlayerCount';
  playerCount: Scalars['Int'];
  totalWins: Scalars['Int'];
  totalMatches: Scalars['Int'];
};

export type Player = Node & {
   __typename?: 'Player';
  id: Scalars['ID'];
  displayName: Scalars['String'];
  steamId?: Maybe<Scalars['String']>;
  totalWins: Scalars['Int'];
  totalMatches: Scalars['Int'];
};


export type PlayerTotalWinsArgs = {
  factionId?: Maybe<Scalars['Int']>;
  fromDate?: Maybe<Scalars['String']>;
};


export type PlayerTotalMatchesArgs = {
  factionId?: Maybe<Scalars['Int']>;
  fromDate?: Maybe<Scalars['String']>;
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

export type Match = Node & {
   __typename?: 'Match';
  id: Scalars['ID'];
  datePlayed: Scalars['String'];
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

export type PlayerMatchResult = {
   __typename?: 'PlayerMatchResult';
  id: Scalars['Int'];
  player: Player;
  faction: Faction;
  playerMat: PlayerMat;
  coins: Scalars['Int'];
  tieOrder: Scalars['Int'];
};

export type PlayerMatchResultInput = {
  displayName: Scalars['String'];
  steamId?: Maybe<Scalars['String']>;
  faction: Scalars['String'];
  playerMat: Scalars['String'];
  coins: Scalars['Int'];
};

export type Tier = {
   __typename?: 'Tier';
  id: Scalars['Int'];
  name: Scalars['String'];
  rank: Scalars['Int'];
  factionMatCombos: Array<FactionMatCombo>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}


export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  String: ResolverTypeWrapper<Scalars['String']>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  Query: ResolverTypeWrapper<{}>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  Mutation: ResolverTypeWrapper<{}>,
  Node: ResolversTypes['Player'] | ResolversTypes['Match'],
  PageInfo: ResolverTypeWrapper<PageInfo>,
  DiscordUser: ResolverTypeWrapper<DiscordUser>,
  PlayerMat: ResolverTypeWrapper<PlayerMatModel>,
  PlayerFactionStats: ResolverTypeWrapper<Omit<PlayerFactionStats, 'player'> & { player: ResolversTypes['Player'] }>,
  Faction: ResolverTypeWrapper<FactionModel>,
  FactionMatCombo: ResolverTypeWrapper<FactionMatComboBase>,
  Float: ResolverTypeWrapper<Scalars['Float']>,
  FactionMatComboStatsWithPlayerCount: ResolverTypeWrapper<FactionMatComboStatsWithPlayerCountBase>,
  FactionStatsWithPlayerCount: ResolverTypeWrapper<FactionStatsWithPlayerCountBase>,
  Player: ResolverTypeWrapper<PlayerModel>,
  PlayerConnection: ResolverTypeWrapper<Omit<PlayerConnection, 'edges'> & { edges: Array<ResolversTypes['PlayerEdge']> }>,
  PlayerEdge: ResolverTypeWrapper<Omit<PlayerEdge, 'node'> & { node: ResolversTypes['Player'] }>,
  Match: ResolverTypeWrapper<MatchModel>,
  MatchConnection: ResolverTypeWrapper<Omit<MatchConnection, 'edges'> & { edges: Array<ResolversTypes['MatchEdge']> }>,
  MatchEdge: ResolverTypeWrapper<Omit<MatchEdge, 'node'> & { node: ResolversTypes['Match'] }>,
  PlayerMatchResult: ResolverTypeWrapper<Omit<PlayerMatchResult, 'player' | 'faction' | 'playerMat'> & { player: ResolversTypes['Player'], faction: ResolversTypes['Faction'], playerMat: ResolversTypes['PlayerMat'] }>,
  PlayerMatchResultInput: PlayerMatchResultInput,
  Tier: ResolverTypeWrapper<TierModel>,
  CacheControlScope: CacheControlScope,
  Upload: ResolverTypeWrapper<Scalars['Upload']>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  String: Scalars['String'],
  Boolean: Scalars['Boolean'],
  Query: {},
  Int: Scalars['Int'],
  ID: Scalars['ID'],
  Mutation: {},
  Node: ResolversParentTypes['Player'] | ResolversParentTypes['Match'],
  PageInfo: PageInfo,
  DiscordUser: DiscordUser,
  PlayerMat: PlayerMatModel,
  PlayerFactionStats: Omit<PlayerFactionStats, 'player'> & { player: ResolversParentTypes['Player'] },
  Faction: FactionModel,
  FactionMatCombo: FactionMatComboBase,
  Float: Scalars['Float'],
  FactionMatComboStatsWithPlayerCount: FactionMatComboStatsWithPlayerCountBase,
  FactionStatsWithPlayerCount: FactionStatsWithPlayerCountBase,
  Player: PlayerModel,
  PlayerConnection: Omit<PlayerConnection, 'edges'> & { edges: Array<ResolversParentTypes['PlayerEdge']> },
  PlayerEdge: Omit<PlayerEdge, 'node'> & { node: ResolversParentTypes['Player'] },
  Match: MatchModel,
  MatchConnection: Omit<MatchConnection, 'edges'> & { edges: Array<ResolversParentTypes['MatchEdge']> },
  MatchEdge: Omit<MatchEdge, 'node'> & { node: ResolversParentTypes['Match'] },
  PlayerMatchResult: Omit<PlayerMatchResult, 'player' | 'faction' | 'playerMat'> & { player: ResolversParentTypes['Player'], faction: ResolversParentTypes['Faction'], playerMat: ResolversParentTypes['PlayerMat'] },
  PlayerMatchResultInput: PlayerMatchResultInput,
  Tier: TierModel,
  CacheControlScope: CacheControlScope,
  Upload: Scalars['Upload'],
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  discordMe?: Resolver<Maybe<ResolversTypes['DiscordUser']>, ParentType, ContextType>,
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType, RequireFields<QueryPlayerMatArgs, 'id'>>,
  playerMats?: Resolver<Array<ResolversTypes['PlayerMat']>, ParentType, ContextType>,
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType, RequireFields<QueryFactionArgs, 'id'>>,
  factions?: Resolver<Array<ResolversTypes['Faction']>, ParentType, ContextType>,
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<QueryPlayerArgs, 'id'>>,
  playersByWins?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, RequireFields<QueryPlayersByWinsArgs, 'first'>>,
  playersByName?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, RequireFields<QueryPlayersByNameArgs, 'startsWith' | 'first'>>,
  matches?: Resolver<ResolversTypes['MatchConnection'], ParentType, ContextType, RequireFields<QueryMatchesArgs, 'first'>>,
  tiers?: Resolver<Array<ResolversTypes['Tier']>, ParentType, ContextType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  logMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationLogMatchArgs, 'numRounds' | 'datePlayed' | 'playerMatchResults' | 'shouldPostMatchLog'>>,
}>;

export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Player' | 'Match', ParentType, ContextType>,
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
}>;

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type DiscordUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscordUser'] = ResolversParentTypes['DiscordUser']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  discriminator?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerMatResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerMat'] = ResolversParentTypes['PlayerMat']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  abbrev?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerFactionStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerFactionStats'] = ResolversParentTypes['PlayerFactionStats']> = ResolversObject<{
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type FactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Faction'] = ResolversParentTypes['Faction']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionTotalWinsArgs, never>>,
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionTotalMatchesArgs, never>>,
  statsByPlayerCount?: Resolver<Array<ResolversTypes['FactionStatsWithPlayerCount']>, ParentType, ContextType>,
  factionMatCombos?: Resolver<Array<ResolversTypes['FactionMatCombo']>, ParentType, ContextType>,
  topPlayers?: Resolver<Array<ResolversTypes['PlayerFactionStats']>, ParentType, ContextType, RequireFields<FactionTopPlayersArgs, 'first'>>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type FactionMatComboResolvers<ContextType = any, ParentType extends ResolversParentTypes['FactionMatCombo'] = ResolversParentTypes['FactionMatCombo']> = ResolversObject<{
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>,
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>,
  topPlayers?: Resolver<Array<ResolversTypes['PlayerFactionStats']>, ParentType, ContextType, RequireFields<FactionMatComboTopPlayersArgs, 'first'>>,
  tier?: Resolver<ResolversTypes['Tier'], ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionMatComboTotalWinsArgs, never>>,
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionMatComboTotalMatchesArgs, never>>,
  avgCoinsOnWin?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionMatComboAvgCoinsOnWinArgs, never>>,
  avgRoundsOnWin?: Resolver<ResolversTypes['Float'], ParentType, ContextType, RequireFields<FactionMatComboAvgRoundsOnWinArgs, never>>,
  leastRoundsForWin?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<FactionMatComboLeastRoundsForWinArgs, never>>,
  statsByPlayerCount?: Resolver<Array<ResolversTypes['FactionMatComboStatsWithPlayerCount']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type FactionMatComboStatsWithPlayerCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['FactionMatComboStatsWithPlayerCount'] = ResolversParentTypes['FactionMatComboStatsWithPlayerCount']> = ResolversObject<{
  playerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  avgCoinsOnWin?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  avgRoundsOnWin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>,
  leastRoundsForWin?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type FactionStatsWithPlayerCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['FactionStatsWithPlayerCount'] = ResolversParentTypes['FactionStatsWithPlayerCount']> = ResolversObject<{
  playerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  steamId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<PlayerTotalWinsArgs, never>>,
  totalMatches?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<PlayerTotalMatchesArgs, never>>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerConnection'] = ResolversParentTypes['PlayerConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['PlayerEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerEdge'] = ResolversParentTypes['PlayerEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['Player'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type MatchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  datePlayed?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  numRounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  playerMatchResults?: Resolver<Array<ResolversTypes['PlayerMatchResult']>, ParentType, ContextType>,
  winner?: Resolver<ResolversTypes['PlayerMatchResult'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type MatchConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MatchConnection'] = ResolversParentTypes['MatchConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['MatchEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type MatchEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MatchEdge'] = ResolversParentTypes['MatchEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['Match'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type PlayerMatchResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerMatchResult'] = ResolversParentTypes['PlayerMatchResult']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>,
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>,
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>,
  coins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  tieOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type TierResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tier'] = ResolversParentTypes['Tier']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  factionMatCombos?: Resolver<Array<ResolversTypes['FactionMatCombo']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload'
}

export type Resolvers<ContextType = any> = ResolversObject<{
  Query?: QueryResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Node?: NodeResolvers,
  PageInfo?: PageInfoResolvers<ContextType>,
  DiscordUser?: DiscordUserResolvers<ContextType>,
  PlayerMat?: PlayerMatResolvers<ContextType>,
  PlayerFactionStats?: PlayerFactionStatsResolvers<ContextType>,
  Faction?: FactionResolvers<ContextType>,
  FactionMatCombo?: FactionMatComboResolvers<ContextType>,
  FactionMatComboStatsWithPlayerCount?: FactionMatComboStatsWithPlayerCountResolvers<ContextType>,
  FactionStatsWithPlayerCount?: FactionStatsWithPlayerCountResolvers<ContextType>,
  Player?: PlayerResolvers<ContextType>,
  PlayerConnection?: PlayerConnectionResolvers<ContextType>,
  PlayerEdge?: PlayerEdgeResolvers<ContextType>,
  Match?: MatchResolvers<ContextType>,
  MatchConnection?: MatchConnectionResolvers<ContextType>,
  MatchEdge?: MatchEdgeResolvers<ContextType>,
  PlayerMatchResult?: PlayerMatchResultResolvers<ContextType>,
  Tier?: TierResolvers<ContextType>,
  Upload?: GraphQLScalarType,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
