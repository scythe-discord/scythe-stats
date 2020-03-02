import { merge } from 'lodash';

import {
  typeDef as factionTypeDef,
  resolvers as factionResolvers
} from './faction';
import {
  typeDef as factionMatComboTypeDef,
  resolvers as factionMatComboResolvers
} from './faction-mat-combo';
import {
  typeDef as factionStatsWithPlayerCountTypeDef,
  resolvers as factionStatsWithPlayerCountResolvers
} from './faction-stats-with-player-count';

export const typeDef = [
  factionTypeDef,
  factionMatComboTypeDef,
  factionStatsWithPlayerCountTypeDef
];
export const resolvers = merge(
  factionResolvers,
  factionMatComboResolvers,
  factionStatsWithPlayerCountResolvers
);
