import { merge } from 'lodash';

import { typeDef as tierTypeDef, resolvers as tierResolvers } from './tier';

export const typeDef = [tierTypeDef];
export const resolvers = merge(tierResolvers);
