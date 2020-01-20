import { merge } from 'lodash';

import { Query, Mutation } from './root';
import {
  typeDef as scytheTypeDef,
  resolvers as scytheResolvers
} from './scythe';
import {
  typeDef as matchTypeDef,
  resolvers as matchResolvers
} from './matches';

export default {
  typeDefs: [Query, Mutation, scytheTypeDef, ...matchTypeDef],
  resolvers: merge(scytheResolvers, matchResolvers)
};
