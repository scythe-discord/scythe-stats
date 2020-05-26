import { merge } from 'lodash';

import {
  typeDef as discordUserTypeDef,
  resolvers as discordUserResolvers,
} from './discord-user';

export const typeDef = [discordUserTypeDef];
export const resolvers = merge(discordUserResolvers);
