import { merge } from 'lodash';

import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers,
} from './player';
import {
  typeDef as playersByWinsTypeDef,
  resolvers as playersByWinsResolvers,
} from './players-by-wins';

export const typeDef = [playerTypeDef, playersByWinsTypeDef];
export const resolvers = merge(playerResolvers, playersByWinsResolvers);
