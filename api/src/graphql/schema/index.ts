import { gql } from 'apollo-server';
import { merge } from 'lodash';

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
import { typeDef as relayTypeDef, resolvers as relayResolvers } from './relay';

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

export default {
  typeDefs: [
    Query,
    Mutation,
    relayTypeDef,
    ...playerMatsTypeDef,
    ...factionsTypeDef,
    ...playerTypeDef,
    ...matchTypeDef,
  ],
  resolvers: merge(
    relayResolvers,
    playerMatsResolvers,
    factionsResolvers,
    playerResolvers,
    matchResolvers
  ),
};
