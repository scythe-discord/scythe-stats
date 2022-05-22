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

export type LogMatchMutationVariables = Exact<{
  numRounds: Scalars['Int'];
  datePlayed: Scalars['String'];
  playerMatchResults: Array<PlayerMatchResultInput> | PlayerMatchResultInput;
  shouldPostMatchLog: Scalars['Boolean'];
}>;


export type LogMatchMutation = { __typename?: 'Mutation', logMatch?: { __typename?: 'Match', id: string, datePlayed: string, numRounds: number, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, tieOrder: number, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string } }>, winner: { __typename?: 'PlayerMatchResult', id: number } } | null };

export type BidPresetsQueryVariables = Exact<{ [key: string]: never; }>;


export type BidPresetsQuery = { __typename?: 'Query', bidPresets: Array<{ __typename?: 'BidPreset', id: number, name: string, bidPresetSettings: Array<{ __typename?: 'BidPresetSetting', id: number, enabled: boolean, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string } }> }> };

export type DiscordMeQueryVariables = Exact<{ [key: string]: never; }>;


export type DiscordMeQuery = { __typename?: 'Query', discordMe?: { __typename?: 'DiscordUser', id: string, username: string, discriminator: string } | null };

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


export type MatchesQuery = { __typename?: 'Query', matches: { __typename?: 'MatchConnection', edges: Array<{ __typename?: 'MatchEdge', node: { __typename?: 'Match', id: string, datePlayed: string, numRounds: number, playerMatchResults: Array<{ __typename?: 'PlayerMatchResult', id: number, coins: number, tieOrder: number, player: { __typename?: 'Player', id: string, displayName: string, steamId?: string | null }, faction: { __typename?: 'Faction', id: number, name: string }, playerMat: { __typename?: 'PlayerMat', id: number, name: string } }>, winner: { __typename?: 'PlayerMatchResult', id: number } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor?: string | null } } };

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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogMatchMutation, LogMatchMutationVariables>(LogMatchDocument, options);
      }
export type LogMatchMutationHookResult = ReturnType<typeof useLogMatchMutation>;
export type LogMatchMutationResult = Apollo.MutationResult<LogMatchMutation>;
export type LogMatchMutationOptions = Apollo.BaseMutationOptions<LogMatchMutation, LogMatchMutationVariables>;
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