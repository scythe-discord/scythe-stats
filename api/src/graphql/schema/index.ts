import { gql } from 'graphql-tag';
import { merge } from 'lodash';

import { typeDef as authTypeDef, resolvers as authResolvers } from './auth';
import {
  typeDef as factionsTypeDef,
  resolvers as factionsResolvers,
} from './factions';
import {
  typeDef as playerMatsTypeDef,
  resolvers as playerMatsResolvers,
} from './player-mats';
import {
  typeDef as matchTypeDef,
  resolvers as matchResolvers,
} from './matches';
import {
  typeDef as playerTypeDef,
  resolvers as playerResolvers,
} from './players';
import { typeDef as tierTypeDef, resolvers as tierResolvers } from './tiers';
import { typeDef as relayTypeDef, resolvers as relayResolvers } from './relay';
import { typeDef as bidsTypeDef, resolvers as bidsResolvers } from './bids';
import { rateLimitDirective } from './directives';
import { makeExecutableSchema } from '@graphql-tools/schema';

export const Query = gql`
  type Query {
    _empty: String
  }
`;

export const Mutation = gql`
  type Mutation {
    _empty: String
  }
`;

export const Subscription = gql`
  type Subscription {
    _empty: String
  }
`;

const { rateLimitDirectiveTypeDef, rateLimitDirectiveTransformer } =
  rateLimitDirective('rateLimit');
export default rateLimitDirectiveTransformer(
  makeExecutableSchema({
    typeDefs: [
      Query,
      Mutation,
      Subscription,
      relayTypeDef,
      rateLimitDirectiveTypeDef,
      ...authTypeDef,
      ...playerMatsTypeDef,
      ...factionsTypeDef,
      ...playerTypeDef,
      ...matchTypeDef,
      ...tierTypeDef,
      ...bidsTypeDef,
    ],
    resolvers: merge(
      authResolvers,
      relayResolvers,
      playerMatsResolvers,
      factionsResolvers,
      playerResolvers,
      matchResolvers,
      tierResolvers,
      bidsResolvers
    ),
  })
);
