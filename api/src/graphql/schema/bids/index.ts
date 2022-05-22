import { merge } from 'lodash';
import {
  typeDef as bidPresetTypeDef,
  resolvers as bidPresetResolvers,
} from './bid_preset';

export const typeDef = [bidPresetTypeDef];
export const resolvers = merge(bidPresetResolvers);
