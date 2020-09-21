import { merge } from 'lodash';

import {
  typeDef as factionTypeDef,
  resolvers as factionResolvers,
} from './faction';
import {
  typeDef as factionMatComboTypeDef,
  resolvers as factionMatComboResolvers,
} from './faction-mat-combo';
import {
  typeDef as factionMatComboStatsWithPlayerCountTypeDef,
  resolvers as factionMatComboStatsWithPlayerCountResolvers,
} from './faction-mat-combo-stats-with-player-count';
import {
  typeDef as factionStatsWithPlayerCountTypeDef,
  resolvers as factionStatsWithPlayerCountResolvers,
} from './faction-stats-with-player-count';

export const typeDef = [
  factionTypeDef,
  factionMatComboTypeDef,
  factionMatComboStatsWithPlayerCountTypeDef,
  factionStatsWithPlayerCountTypeDef,
];
export const resolvers = merge(
  factionResolvers,
  factionMatComboResolvers,
  factionMatComboStatsWithPlayerCountResolvers,
  factionStatsWithPlayerCountResolvers
);
