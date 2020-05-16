import { merge } from 'lodash';

import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers,
} from './player';
import {
  typeDef as playersByWinsTypeDef,
  resolvers as playersByWinsResolvers,
} from './players-by-wins';
import {
  typeDef as playersByNameTypeDef,
  resolvers as playersByNameResolvers,
} from './players-by-name';

export const typeDef = [
  playerTypeDef,
  playersByWinsTypeDef,
  playersByNameTypeDef,
];
export const resolvers = merge(
  playerResolvers,
  playersByWinsResolvers,
  playersByNameResolvers
);
