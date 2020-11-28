import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  avgCoinsOnWin: Scalars['Float'];
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


export type LogMatchMutationVariables = Exact<{
  numRounds: Scalars['Int'];
  datePlayed: Scalars['String'];
  playerMatchResults: Array<PlayerMatchResultInput>;
  shouldPostMatchLog: Scalars['Boolean'];
}>;


export type LogMatchMutation = (
  { __typename?: 'Mutation' }
  & { logMatch?: Maybe<(
    { __typename?: 'Match' }
    & Pick<Match, 'id' | 'datePlayed' | 'numRounds'>
    & { playerMatchResults: Array<(
      { __typename?: 'PlayerMatchResult' }
      & Pick<PlayerMatchResult, 'id' | 'coins' | 'tieOrder'>
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
  )> }
);

export type DiscordMeQueryVariables = Exact<{ [key: string]: never; }>;


export type DiscordMeQuery = (
  { __typename?: 'Query' }
  & { discordMe?: Maybe<(
    { __typename?: 'DiscordUser' }
    & Pick<DiscordUser, 'id' | 'username' | 'discriminator'>
  )> }
);

export type FactionStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type FactionStatsQuery = (
  { __typename?: 'Query' }
  & { factions: Array<(
    { __typename?: 'Faction' }
    & Pick<Faction, 'id' | 'name'>
    & { statsByPlayerCount: Array<(
      { __typename?: 'FactionStatsWithPlayerCount' }
      & Pick<FactionStatsWithPlayerCount, 'playerCount' | 'totalWins' | 'totalMatches'>
    )>, factionMatCombos: Array<(
      { __typename?: 'FactionMatCombo' }
      & { playerMat: (
        { __typename?: 'PlayerMat' }
        & Pick<PlayerMat, 'id' | 'name'>
      ), statsByPlayerCount: Array<(
        { __typename?: 'FactionMatComboStatsWithPlayerCount' }
        & Pick<FactionMatComboStatsWithPlayerCount, 'playerCount' | 'totalWins' | 'totalMatches' | 'avgCoinsOnWin' | 'avgRoundsOnWin' | 'leastRoundsForWin'>
      )> }
    )> }
  )> }
);

export type FactionTopPlayersQueryVariables = Exact<{
  numTopPlayers: Scalars['Int'];
  playerCounts: Array<Scalars['Int']>;
}>;


export type FactionTopPlayersQuery = (
  { __typename?: 'Query' }
  & { factions: Array<(
    { __typename?: 'Faction' }
    & Pick<Faction, 'id'>
    & { topPlayers: Array<(
      { __typename?: 'PlayerFactionStats' }
      & Pick<PlayerFactionStats, 'totalWins'>
      & { player: (
        { __typename?: 'Player' }
        & Pick<Player, 'id' | 'displayName' | 'steamId'>
      ) }
    )> }
  )> }
);

export type MatchesQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
}>;


export type MatchesQuery = (
  { __typename?: 'Query' }
  & { matches: (
    { __typename?: 'MatchConnection' }
    & { edges: Array<(
      { __typename?: 'MatchEdge' }
      & { node: (
        { __typename?: 'Match' }
        & Pick<Match, 'id' | 'datePlayed' | 'numRounds'>
        & { playerMatchResults: Array<(
          { __typename?: 'PlayerMatchResult' }
          & Pick<PlayerMatchResult, 'id' | 'coins' | 'tieOrder'>
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
    )>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'hasNextPage' | 'endCursor'>
    ) }
  ) }
);

export type PlayerMatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlayerMatsQuery = (
  { __typename?: 'Query' }
  & { playerMats: Array<(
    { __typename?: 'PlayerMat' }
    & Pick<PlayerMat, 'id' | 'name'>
  )> }
);

export type PlayersByNameQueryVariables = Exact<{
  startsWith: Scalars['String'];
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
}>;


export type PlayersByNameQuery = (
  { __typename?: 'Query' }
  & { playersByName: (
    { __typename?: 'PlayerConnection' }
    & { edges: Array<(
      { __typename?: 'PlayerEdge' }
      & { node: (
        { __typename?: 'Player' }
        & Pick<Player, 'id' | 'displayName' | 'steamId'>
      ) }
    )> }
  ) }
);

export type TiersQueryVariables = Exact<{
  numTopPlayers: Scalars['Int'];
}>;


export type TiersQuery = (
  { __typename?: 'Query' }
  & { tiers: Array<(
    { __typename?: 'Tier' }
    & Pick<Tier, 'id' | 'name' | 'rank'>
    & { factionMatCombos: Array<(
      { __typename?: 'FactionMatCombo' }
      & Pick<FactionMatCombo, 'totalWins' | 'totalMatches' | 'avgCoinsOnWin' | 'avgRoundsOnWin' | 'leastRoundsForWin'>
      & { faction: (
        { __typename?: 'Faction' }
        & Pick<Faction, 'id' | 'name'>
      ), playerMat: (
        { __typename?: 'PlayerMat' }
        & Pick<PlayerMat, 'id' | 'name' | 'abbrev'>
      ), topPlayers: Array<(
        { __typename?: 'PlayerFactionStats' }
        & Pick<PlayerFactionStats, 'totalWins'>
        & { player: (
          { __typename?: 'Player' }
          & Pick<Player, 'id' | 'displayName' | 'steamId'>
        ) }
      )> }
    )> }
  )> }
);

export type TopPlayersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['String']>;
}>;


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


export const LogMatchDocument = gql`
    mutation logMatch($numRounds: Int!, $datePlayed: String!, $playerMatchResults: [PlayerMatchResultInput!]!, $shouldPostMatchLog: Boolean!) {
  logMatch(
    numRounds: $numRounds
    datePlayed: $datePlayed
    playerMatchResults: $playerMatchResults
    shouldPostMatchLog: $shouldPostMatchLog
  ) {
    id
    datePlayed
    numRounds
    playerMatchResults {
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
      tieOrder
    }
    winner {
      id
    }
  }
}
    `;
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
 *   },
 * });
 */
export function useLogMatchMutation(baseOptions?: Apollo.MutationHookOptions<LogMatchMutation, LogMatchMutationVariables>) {
        return Apollo.useMutation<LogMatchMutation, LogMatchMutationVariables>(LogMatchDocument, baseOptions);
      }
export type LogMatchMutationHookResult = ReturnType<typeof useLogMatchMutation>;
export type LogMatchMutationResult = Apollo.MutationResult<LogMatchMutation>;
export type LogMatchMutationOptions = Apollo.BaseMutationOptions<LogMatchMutation, LogMatchMutationVariables>;
export const DiscordMeDocument = gql`
    query discordMe {
  discordMe {
    id
    username
    discriminator
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
        return Apollo.useQuery<DiscordMeQuery, DiscordMeQueryVariables>(DiscordMeDocument, baseOptions);
      }
export function useDiscordMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscordMeQuery, DiscordMeQueryVariables>) {
          return Apollo.useLazyQuery<DiscordMeQuery, DiscordMeQueryVariables>(DiscordMeDocument, baseOptions);
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
        return Apollo.useQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, baseOptions);
      }
export function useFactionStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FactionStatsQuery, FactionStatsQueryVariables>) {
          return Apollo.useLazyQuery<FactionStatsQuery, FactionStatsQueryVariables>(FactionStatsDocument, baseOptions);
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
        return Apollo.useQuery<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>(FactionTopPlayersDocument, baseOptions);
      }
export function useFactionTopPlayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>) {
          return Apollo.useLazyQuery<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>(FactionTopPlayersDocument, baseOptions);
        }
export type FactionTopPlayersQueryHookResult = ReturnType<typeof useFactionTopPlayersQuery>;
export type FactionTopPlayersLazyQueryHookResult = ReturnType<typeof useFactionTopPlayersLazyQuery>;
export type FactionTopPlayersQueryResult = Apollo.QueryResult<FactionTopPlayersQuery, FactionTopPlayersQueryVariables>;
export const MatchesDocument = gql`
    query matches($first: Int!, $after: String) {
  matches(first: $first, after: $after) {
    edges {
      node {
        id
        datePlayed
        numRounds
        playerMatchResults {
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
          tieOrder
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
export function useMatchesQuery(baseOptions: Apollo.QueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
        return Apollo.useQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, baseOptions);
      }
export function useMatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MatchesQuery, MatchesQueryVariables>) {
          return Apollo.useLazyQuery<MatchesQuery, MatchesQueryVariables>(MatchesDocument, baseOptions);
        }
export type MatchesQueryHookResult = ReturnType<typeof useMatchesQuery>;
export type MatchesLazyQueryHookResult = ReturnType<typeof useMatchesLazyQuery>;
export type MatchesQueryResult = Apollo.QueryResult<MatchesQuery, MatchesQueryVariables>;
export const PlayerMatsDocument = gql`
    query playerMats {
  playerMats {
    id
    name
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
        return Apollo.useQuery<PlayerMatsQuery, PlayerMatsQueryVariables>(PlayerMatsDocument, baseOptions);
      }
export function usePlayerMatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlayerMatsQuery, PlayerMatsQueryVariables>) {
          return Apollo.useLazyQuery<PlayerMatsQuery, PlayerMatsQueryVariables>(PlayerMatsDocument, baseOptions);
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
        return Apollo.useQuery<PlayersByNameQuery, PlayersByNameQueryVariables>(PlayersByNameDocument, baseOptions);
      }
export function usePlayersByNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlayersByNameQuery, PlayersByNameQueryVariables>) {
          return Apollo.useLazyQuery<PlayersByNameQuery, PlayersByNameQueryVariables>(PlayersByNameDocument, baseOptions);
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
        return Apollo.useQuery<TiersQuery, TiersQueryVariables>(TiersDocument, baseOptions);
      }
export function useTiersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TiersQuery, TiersQueryVariables>) {
          return Apollo.useLazyQuery<TiersQuery, TiersQueryVariables>(TiersDocument, baseOptions);
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
        return Apollo.useQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, baseOptions);
      }
export function useTopPlayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopPlayersQuery, TopPlayersQueryVariables>) {
          return Apollo.useLazyQuery<TopPlayersQuery, TopPlayersQueryVariables>(TopPlayersDocument, baseOptions);
        }
export type TopPlayersQueryHookResult = ReturnType<typeof useTopPlayersQuery>;
export type TopPlayersLazyQueryHookResult = ReturnType<typeof useTopPlayersLazyQuery>;
export type TopPlayersQueryResult = Apollo.QueryResult<TopPlayersQuery, TopPlayersQueryVariables>;