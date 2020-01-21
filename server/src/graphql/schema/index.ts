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
  typeDefs: [Query, Mutation, scytheTypeDef, ...matchTypeDef],
  resolvers: merge(scytheResolvers, matchResolvers)
};
