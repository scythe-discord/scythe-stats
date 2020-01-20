import { gql } from 'apollo-server-express';

import Schema from './codegen';

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
    faction: (): Schema.Query['faction'] => null,
    playerMat: (): Schema.Query['playerMat'] => null
  }
};
