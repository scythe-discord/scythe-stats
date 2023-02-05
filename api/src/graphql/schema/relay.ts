import { gql } from 'graphql-tag';

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
  Node: {
    // @ts-ignore: TS complains that the type string may not be a type of
    // an actual Node, but having this actually happen in practice in unlikely
    __resolveType: (node) => {
      const { type } = fromGlobalId(node.id.toString());

      return type;
    },
  },
};
