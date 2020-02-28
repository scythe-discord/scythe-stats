import { merge } from 'lodash';

import {
  typeDef as factionTypeDef,
  resolvers as factionResolvers
} from './faction';

export const typeDef = [factionTypeDef];
export const resolvers = merge(factionResolvers);
