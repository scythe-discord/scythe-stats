import { gql } from 'apollo-boost';
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
  totalWins: Scalars['Int'],
  totalMatches: Scalars['Int'],
  statsByPlayerCount: Array<FactionStatsWithPlayerCount>,
  factionMatCombos: Array<FactionMatCombo>,
  topPlayers: Array<PlayerFactionStats>,
};


export type FactionTopPlayersArgs = {
  first: Scalars['Int']
};

export type FactionMatCombo = {
   __typename?: 'FactionMatCombo',
  faction: Faction,
  playerMat: PlayerMat,
  totalWins: Scalars['Int'],
  totalMatches: Scalars['Int'],
  avgCoinsOnWin: Scalars['Int'],
  avgRoundsOnWin: Scalars['Float'],
  leastRoundsForWin: Scalars['Int'],
};

export type FactionStatsWithPlayerCount = {
   __typename?: 'FactionStatsWithPlayerCount',
  playerCount: Scalars['Int'],
  totalWins: Scalars['Int'],
  totalMatches: Scalars['Int'],
};

export type Match = Node & {
   __typename?: 'Match',
  id: Scalars['ID'],
  datePlayed: Scalars['String'],
  numRounds: Scalars['Int'],
  playerResults: Array<PlayerMatchResult>,
  winner: PlayerMatchResult,
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
  totalMatches: Scalars['Int'],
};


export type PlayerTotalWinsArgs = {
  factionId?: Maybe<Scalars['Int']>,
  fromDate?: Maybe<Scalars['String']>
};


export type PlayerTotalMatchesArgs = {
  factionId?: Maybe<Scalars['Int']>,
  fromDate?: Maybe<Scalars['String']>
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

export type PlayerFactionStats = {
   __typename?: 'PlayerFactionStats',
  player: Player,
  totalWins: Scalars['Int'],
};

export type PlayerMat = {
   __typename?: 'PlayerMat',
  id: Scalars['Int'],
  name: Scalars['String'],
};

export type PlayerMatchResult = {
   __typename?: 'PlayerMatchResult',
  id: Scalars['Int'],
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
  playerMat?: Maybe<PlayerMat>,
  faction: Faction,
  factions: Array<Faction>,
  player?: Maybe<Player>,
  playersByWins: PlayerConnection,
  matches: MatchConnection,
};


export type QueryPlayerMatArgs = {
  name: Scalars['String']
};


export type QueryFactionArgs = {
  id: Scalars['Int']
};


export type QueryPlayerArgs = {
  id: Scalars['ID']
};


export type QueryPlayersByWinsArgs = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>,
  factionId?: Maybe<Scalars['Int']>,
  fromDate?: Maybe<Scalars['String']>
};


export type QueryMatchesArgs = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>
};


export type FactionStatsQueryVariables = {
  numTopPlayers: Scalars['Int']
};


export type FactionStatsQuery = (
  { __typename?: 'Query' }
  & { factions: Array<(
    { __typename?: 'Faction' }
    & Pick<Faction, 'id' | 'name' | 'totalWins' | 'totalMatches'>
    & { topPlayers: Array<(
      { __typename?: 'PlayerFactionStats' }
      & Pick<PlayerFactionStats, 'totalWins'>
      & { player: (
        { __typename?: 'Player' }
        & Pick<Player, 'id' | 'displayName' | 'steamId'>
      ) }
    )>, statsByPlayerCount: Array<(
      { __typename?: 'FactionStatsWithPlayerCount' }
      & Pick<FactionStatsWithPlayerCount, 'playerCount' | 'totalWins' | 'totalMatches'>
    )>, factionMatCombos: Array<(
      { __typename?: 'FactionMatCombo' }
      & Pick<FactionMatCombo, 'totalWins' | 'totalMatches' | 'avgCoinsOnWin' | 'avgRoundsOnWin' | 'leastRoundsForWin'>
      & { playerMat: (
        { __typename?: 'PlayerMat' }
        & Pick<PlayerMat, 'id' | 'name'>
      ) }
    )> }
  )> }
);

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
          & Pick<PlayerMatchResult, 'id' | 'coins'>
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
        )>, winner: (
          { __typename?: 'PlayerMatchResult' }
          & Pick<PlayerMatchResult, 'id'>
        ) }
      ) }
    )> }
  ) }
);

export type TopPlayersQueryVariables = {
  first: Scalars['Int'],
  after?: Maybe<Scalars['String']>,
  fromDate?: Maybe<Scalars['String']>
};


export type TopPlayersQuery = (
  { __typename?: 'Query' }
  & { playersByWins: (
    { __typename?: 'PlayerConnection' }
    & { edges: Array<(
      { __typename?: 'PlayerEdge' }
      & { node: (
        { __typename?: 'Player' }
        & Pick<Player, 'id' | 'displayName' | 'steamId' | 'totalWins' | 'totalMatches'>
      ) }
    )> }
  ) }
);


export const FactionStatsDocument = gql`
    query factionStats($numTopPlayers: Int!) {
  factions {
    id
    name
    totalWins
    totalMatches
    topPlayers(first: $numTopPlayers) {
      player {
        id
        displayName
        steamId
      }
      totalWins
    }
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
 *      numTopPlayers: // value for 'numTopPlayers'
 *   },
 * });
 */
export function useFactionStatsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FactionStatsQuery, FactionStatsQueryVariables>) {
        return ApolloReactHooks.useQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, baseOptions);
      }
export function useFactionStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FactionStatsQuery, FactionStatsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, baseOptions);
        }
export type FactionStatsQueryHookResult = ReturnType<typeof useFactionStatsQuery>;
export type FactionStatsLazyQueryHookResult = ReturnType<typeof useFactionStatsLazyQuery>;
export type FactionStatsQueryResult = ApolloReactCommon.QueryResult<FactionStatsQuery, FactionStatsQueryVariables>;
export const MatchesDocument = gql`
    query matches($first: Int!, $after: String) {
  matches(first: $first, after: $after) {
    edges {
      node {
        id
        datePlayed
        numRounds
        playerResults {
          id
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
        winner {
          id
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
export function useTopPlayersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<TopPlayersQuery, TopPlayersQueryVariables>) {
        return ApolloReactHooks.useQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, baseOptions);
      }
export function useTopPlayersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TopPlayersQuery, TopPlayersQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, baseOptions);
        }
export type TopPlayersQueryHookResult = ReturnType<typeof useTopPlayersQuery>;
export type TopPlayersLazyQueryHookResult = ReturnType<typeof useTopPlayersLazyQuery>;
export type TopPlayersQueryResult = ApolloReactCommon.QueryResult<TopPlayersQuery, TopPlayersQueryVariables>;