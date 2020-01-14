import { gql } from 'apollo-server-express';

import { Query } from './types';

export const typeDef = gql`
  extend type Query {
    faction(name: String!): Faction
    playerMat(name: String!): PlayerMat
  }

  type Faction {
    id: Int!
    name: String!
  }

  type PlayerMat {
    id: Int!
    name: String!
  }
`;

export const resolvers = {
  Query: {
    faction: (): Query['faction'] => null,
    playerMat: (): Query['playerMat'] => null
  }
};
