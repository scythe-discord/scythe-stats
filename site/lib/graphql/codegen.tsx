import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
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

export type MatchConnection = {
   __typename?: 'MatchConnection',
  edges: Array<MatchEdge>,
  pageInfo: PageInfo,
};

export type MatchEdge = {
   __typename?: 'MatchEdge',
  cursor: Scalars['String'],
  node: Match,
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
  hasNextPage?: Maybe<Scalars['Boolean']>,
  hasPreviousPage?: Maybe<Scalars['Boolean']>,
  startCursor?: Maybe<Scalars['String']>,
  endCursor?: Maybe<Scalars['String']>,
};

export type Player = Node & {
   __typename?: 'Player',
  id: Scalars['ID'],
  displayName: Scalars['String'],
  steamId?: Maybe<Scalars['String']>,
  totalWins: Scalars['Int'],
};

export type PlayerConnection = {
   __typename?: 'PlayerConnection',
  edges: Array<PlayerEdge>,
  pageInfo: PageInfo,
};

export type PlayerEdge = {
   __typename?: 'PlayerEdge',
  cursor: Scalars['String'],
  node: Player,
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

export enum PlayerOrderBy {
  Unordered = 'UNORDERED',
  Wins = 'WINS'
}

export type Query = {
   __typename?: 'Query',
  _empty?: Maybe<Scalars['String']>,
  faction?: Maybe<Faction>,
  playerMat?: Maybe<PlayerMat>,
  player?: Maybe<Player>,
  players: PlayerConnection,
  matches: MatchConnection,
};


export type QueryFactionArgs = {
  name: Scalars['String']
};


export type QueryPlayerMatArgs = {
  name: Scalars['String']
};


export type QueryPlayerArgs = {
  id: Scalars['ID']
};


export type QueryPlayersArgs = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>,
  orderBy?: Maybe<PlayerOrderBy>
};


export type QueryMatchesArgs = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>
};


export type MatchesQueryVariables = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>
};


export type MatchesQuery = (
  { __typename?: 'Query' }
  & { matches: (
    { __typename?: 'MatchConnection' }
    & { edges: Array<(
      { __typename?: 'MatchEdge' }
      & Pick<MatchEdge, 'cursor'>
      & { node: (
        { __typename?: 'Match' }
        & Pick<Match, 'id' | 'datePlayed' | 'numRounds'>
        & { playerResults: Array<(
          { __typename?: 'PlayerMatchResult' }
          & Pick<PlayerMatchResult, 'coins'>
          & { player: (
            { __typename?: 'Player' }
            & Pick<Player, 'id' | 'displayName' | 'steamId'>
          ), faction: (
            { __typename?: 'Faction' }
            & Pick<Faction, 'id' | 'name'>
          ), playerMat: (
            { __typename?: 'PlayerMat' }
            & Pick<PlayerMat, 'id' | 'name'>
          ) }
        )> }
      ) }
    )> }
  ) }
);


export const MatchesDocument = gql`
    query matches($first: Int!, $after: String) {
  matches(first: $first, after: $after) {
    edges {
      node {
        id
        datePlayed
        numRounds
        playerResults {
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
        }
      }
      cursor
    }
  }
}
    `;

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
export function useMatchesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
        return ApolloReactHooks.useQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, baseOptions);
      }
export function useMatchesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, baseOptions);
        }
export type MatchesQueryHookResult = ReturnType<typeof useMatchesQuery>;
export type MatchesLazyQueryHookResult = ReturnType<typeof useMatchesLazyQuery>;
export type MatchesQueryResult = ApolloReactCommon.QueryResult<MatchesQuery, MatchesQueryVariables>;