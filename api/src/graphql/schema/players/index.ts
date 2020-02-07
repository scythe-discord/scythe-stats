import { merge } from 'lodash';

import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers
} from './player';
import {
  typeDef as playersTypeDef,
  resolvers as playersResolvers
} from './players';

export const typeDef = [playerTypeDef, playersTypeDef];
export const resolvers = merge(playerResolvers, playersResolvers);
