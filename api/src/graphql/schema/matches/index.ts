import { merge } from 'lodash';

import { typeDef as matchTypeDef, resolvers as matchResolvers } from './match';
import {
  typeDef as logMatchTypeDef,
  resolvers as logMatchResolvers,
} from './log-match';

export const typeDef = [matchTypeDef, logMatchTypeDef];
export const resolvers = merge(matchResolvers, logMatchResolvers);
