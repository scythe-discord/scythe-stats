import { merge } from 'lodash';
import {
  typeDef as bidPresetTypeDef,
  resolvers as bidPresetResolvers,
} from './bid_preset';
import {
  typeDef as bidGameTypeDef,
  resolvers as bidGameResolvers,
} from './bid-game'

export const typeDef = [bidGameTypeDef, bidPresetTypeDef];
export const resolvers = merge(bidPresetResolvers, bidGameResolvers);
