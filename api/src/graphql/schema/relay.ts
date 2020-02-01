import { gql } from 'apollo-server';

export const typeDef = gql`
  interface Node {
    id: ID!
  }

  type PageInfo {
    hasNextPage: Boolean
    hasPreviousPage: Boolean
    startCursor: String
    endCursor: String
  }
`;

export const resolvers = {};
