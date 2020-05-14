import { gql } from 'apollo-server';

import Schema from './codegen';
import { fromGlobalId } from 'graphql-relay';

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

export const resolvers: Schema.Resolvers = {
  // @ts-ignore: TS complains that the type string may not be a type of
  // an actual Node, but having this actually happen in practice in unlikely
  Node: {
    __resolveType: node => {
      const { type } = fromGlobalId(node.id);

      return type;
    }
  }
};
