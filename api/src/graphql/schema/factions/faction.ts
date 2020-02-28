import { gql } from 'apollo-server';

import Schema from '../codegen';

export const typeDef = gql`
  extend type Query {
    faction(name: String!): Faction
  }

  type Faction {
    id: Int!
    name: String!
  }
`;

export const resolvers = {
  Query: {
    faction: (): Schema.Query['faction'] => null
  }
};
