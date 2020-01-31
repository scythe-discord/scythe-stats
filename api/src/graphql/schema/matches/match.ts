import { gql } from 'apollo-server';
import { toGlobalId } from 'graphql-relay';

import Schema from '../codegen';

export const typeDef = gql`
  type Match implements Node {
    id: ID!
    datePlayed: String!
    numRounds: Int!
    playerResults: [PlayerMatchResult!]!
  }

  type PlayerMatchResult {
    player: Player!
    faction: Faction!
    playerMat: PlayerMat!
    coins: Int!
  }
`;

export const resolvers: Schema.Resolvers = {
  Match: {
    id: match => toGlobalId('Match', match.id.toString())
  }
};
