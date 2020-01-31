import { gql } from 'apollo-server';
import { merge } from 'lodash';

import {
  typeDef as scytheTypeDef,
  resolvers as scytheResolvers
} from './scythe';
import {
  typeDef as matchTypeDef,
  resolvers as matchResolvers
} from './matches';
import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers
} from './player';
import { typeDef as relayTypeDef, resolvers as relayResolvers } from './relay';

export const Query = gql`
  type Query {
    _empty: String
  }
`;

export const Mutation = gql`
  type Mutation {
    _empty: String
  }
`;

export default {
  typeDefs: [
    Query,
    Mutation,
    relayTypeDef,
    scytheTypeDef,
    playerTypeDef,
    ...matchTypeDef
  ],
  resolvers: merge(
    relayResolvers,
    scytheResolvers,
    playerResolvers,
    matchResolvers
  )
};
