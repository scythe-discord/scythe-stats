import { gql } from 'apollo-server';
import { toGlobalId } from 'graphql-relay';

import Schema from '../codegen';

export const typeDef = gql`
  type Player implements Node {
    id: ID!
    displayName: String!
    steamId: String
  }
`;

export const resolvers: Schema.Resolvers = {
  Player: {
    id: player => toGlobalId('Player', player.id.toString())
  }
};
