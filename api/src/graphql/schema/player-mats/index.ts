import { merge } from 'lodash';

import {
  typeDef as playerMatTypeDef,
  resolvers as playerMatResolvers,
} from './player-mat';

export const typeDef = [playerMatTypeDef];
export const resolvers = merge(playerMatResolvers);
