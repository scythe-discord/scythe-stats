import { merge } from 'lodash';

import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers
} from './player';

export const typeDef = [playerTypeDef];
export const resolvers = merge(playerResolvers);
