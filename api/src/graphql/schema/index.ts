import { gql } from 'apollo-server';
import { merge } from 'lodash';

import {
  typeDef as scytheTypeDef,
  resolvers as scytheResolvers
} from './scythe';
import {
  typeDef as factionsTypeDef,
  resolvers as factionsResolvers
} from './factions';
import {
  typeDef as matchTypeDef,
  resolvers as matchResolvers
} from './matches';
import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers
} from './players';
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
    ...factionsTypeDef,
    ...playerTypeDef,
    ...matchTypeDef
  ],
  resolvers: merge(
    relayResolvers,
    scytheResolvers,
    factionsResolvers,
    playerResolvers,
    matchResolvers
  )
};
