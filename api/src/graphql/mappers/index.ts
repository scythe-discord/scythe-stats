// Exist for providing typings to graphql-codegen
// Add additional mappers as necessary, but be careful to
// not conflict with actual entity class names

export { default as FactionModel } from '../../db/entities/faction';
export { default as PlayerMatModel } from '../../db/entities/player-mat';
export { default as PlayerModel } from '../../db/entities/player';
export { default as TierModel } from '../../db/entities/tier';
export { default as MatchModel } from '../../db/entities/match';

export * from './faction-mat-combo';
