import { merge } from 'lodash';

import {
  typeDef as factionTypeDef,
  resolvers as factionResolvers
} from './faction';
import {
  typeDef as factionMatComboTypeDef,
  resolvers as factionMatComboResolvers
} from './faction-mat-combo';

export const typeDef = [factionTypeDef, factionMatComboTypeDef];
export const resolvers = merge(factionResolvers, factionMatComboResolvers);
