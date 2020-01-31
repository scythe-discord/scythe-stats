import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { PlayerModel } from '../../../db/entities';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Upload: any,
};


export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Faction = {
   __typename?: 'Faction',
  id: Scalars['Int'],
  name: Scalars['String'],
};

export type Match = Node & {
   __typename?: 'Match',
  id: Scalars['ID'],
  datePlayed: Scalars['String'],
  numRounds: Scalars['Int'],
  playerResults: Array<PlayerMatchResult>,
};

export type Mutation = {
   __typename?: 'Mutation',
  _empty?: Maybe<Scalars['String']>,
  logMatch?: Maybe<Match>,
};


export type MutationLogMatchArgs = {
  numRounds: Scalars['Int'],
  datePlayed: Scalars['String'],
  playerMatchResults: Array<PlayerMatchResultInput>
};

export type Node = {
  id: Scalars['ID'],
};

export type PageInfo = {
   __typename?: 'PageInfo',
  hasNextPage: Scalars['Boolean'],
  hasPreviousPage: Scalars['Boolean'],
  startCursor?: Maybe<Scalars['String']>,
  endCursor?: Maybe<Scalars['String']>,
};

export type Player = Node & {
   __typename?: 'Player',
  id: Scalars['ID'],
  displayName: Scalars['String'],
  steamId?: Maybe<Scalars['String']>,
};

export type PlayerMat = {
   __typename?: 'PlayerMat',
  id: Scalars['Int'],
  name: Scalars['String'],
};

export type PlayerMatchResult = {
   __typename?: 'PlayerMatchResult',
  player: Player,
  faction: Faction,
  playerMat: PlayerMat,
  coins: Scalars['Int'],
};

export type PlayerMatchResultInput = {
  displayName: Scalars['String'],
  steamId?: Maybe<Scalars['String']>,
  faction: Scalars['String'],
  playerMat: Scalars['String'],
  coins: Scalars['Int'],
};

export type Query = {
   __typename?: 'Query',
  _empty?: Maybe<Scalars['String']>,
  faction?: Maybe<Faction>,
  playerMat?: Maybe<PlayerMat>,
};


export type QueryFactionArgs = {
  name: Scalars['String']
};


export type QueryPlayerMatArgs = {
  name: Scalars['String']
};


export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
) => Maybe<TTypes>;

export type isTypeOfResolverFn = (obj: any, info: GraphQLResolveInfo) => boolean;

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
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Faction: ResolverTypeWrapper<Faction>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  PlayerMat: ResolverTypeWrapper<PlayerMat>,
  Mutation: ResolverTypeWrapper<{}>,
  PlayerMatchResultInput: PlayerMatchResultInput,
  Match: ResolverTypeWrapper<Omit<Match, 'playerResults'> & { playerResults: Array<ResolversTypes['PlayerMatchResult']> }>,
  Node: ResolverTypeWrapper<Node>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  PlayerMatchResult: ResolverTypeWrapper<Omit<PlayerMatchResult, 'player'> & { player: ResolversTypes['Player'] }>,
  Player: ResolverTypeWrapper<PlayerModel>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  CacheControlScope: CacheControlScope,
  PageInfo: ResolverTypeWrapper<PageInfo>,
  Upload: ResolverTypeWrapper<Scalars['Upload']>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  String: Scalars['String'],
  Faction: Faction,
  Int: Scalars['Int'],
  PlayerMat: PlayerMat,
  Mutation: {},
  PlayerMatchResultInput: PlayerMatchResultInput,
  Match: Omit<Match, 'playerResults'> & { playerResults: Array<ResolversParentTypes['PlayerMatchResult']> },
  Node: Node,
  ID: Scalars['ID'],
  PlayerMatchResult: Omit<PlayerMatchResult, 'player'> & { player: ResolversParentTypes['Player'] },
  Player: PlayerModel,
  Boolean: Scalars['Boolean'],
  CacheControlScope: CacheControlScope,
  PageInfo: PageInfo,
  Upload: Scalars['Upload'],
}>;

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = {   maxAge?: Maybe<Scalars['Int']>,
  scope?: Maybe<CacheControlScope> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type FactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Faction'] = ResolversParentTypes['Faction']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type MatchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  datePlayed?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  numRounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  playerResults?: Resolver<Array<ResolversTypes['PlayerMatchResult']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  logMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationLogMatchArgs, 'numRounds' | 'datePlayed' | 'playerMatchResults'>>,
}>;

export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Match' | 'Player', ParentType, ContextType>,
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
}>;

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type PlayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  steamId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type PlayerMatResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerMat'] = ResolversParentTypes['PlayerMat']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type PlayerMatchResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerMatchResult'] = ResolversParentTypes['PlayerMatchResult']> = ResolversObject<{
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>,
  faction?: Resolver<ResolversTypes['Faction'], ParentType, ContextType>,
  playerMat?: Resolver<ResolversTypes['PlayerMat'], ParentType, ContextType>,
  coins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  faction?: Resolver<Maybe<ResolversTypes['Faction']>, ParentType, ContextType, RequireFields<QueryFactionArgs, 'name'>>,
  playerMat?: Resolver<Maybe<ResolversTypes['PlayerMat']>, ParentType, ContextType, RequireFields<QueryPlayerMatArgs, 'name'>>,
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload'
}

export type Resolvers<ContextType = any> = ResolversObject<{
  Faction?: FactionResolvers<ContextType>,
  Match?: MatchResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Node?: NodeResolvers,
  PageInfo?: PageInfoResolvers<ContextType>,
  Player?: PlayerResolvers<ContextType>,
  PlayerMat?: PlayerMatResolvers<ContextType>,
  PlayerMatchResult?: PlayerMatchResultResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Upload?: GraphQLScalarType,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>,
}>;


/**
* @deprecated
* Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
*/
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;