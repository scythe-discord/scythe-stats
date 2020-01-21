import { gql } from 'apollo-server';

export const typeDef = gql`
  type Match {
    id: Int!
    datePlayed: String!
    numRounds: Int!
    playerResults: [PlayerMatchResult!]!
  }

  type PlayerMatchResult {
    displayName: String!
    steamId: String
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
  }
`;
