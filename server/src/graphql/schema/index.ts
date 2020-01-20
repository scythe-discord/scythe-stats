import { merge } from 'lodash';

import { Query, Mutation } from './root';
import {
  typeDef as scytheTypeDef,
  resolvers as scytheResolvers
} from './scythe';
import { matchTypeDef, logMatchTypeDef, logMatchResolvers } from './matches';

export default {
  typeDefs: [Query, Mutation, scytheTypeDef, matchTypeDef, logMatchTypeDef],
  resolvers: merge(scytheResolvers, logMatchResolvers)
};
