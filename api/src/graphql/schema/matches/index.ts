import { typeDef as matchTypeDef } from './match';
import {
  typeDef as logMatchTypeDef,
  resolvers as logMatchResolvers
} from './log-match';

export const typeDef = [matchTypeDef, logMatchTypeDef];
export const resolvers = logMatchResolvers;
