import { defaultFieldResolver, GraphQLField } from 'graphql';
import { SchemaDirectiveVisitor, gql } from 'apollo-server-express';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { redisClient } from '../../../common/services';

const DEFAULT_POINTS = 5; // p consumable points every 30 seconds
const DEFAULT_DURATION = 30; // Every d seconds
const DEFAULT_BLOCK_DURATION = 3600; // Block requests if limited

export class RateLimitDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(
    field: GraphQLField<any, any>
  ): GraphQLField<any, any> | void | null {
    const {
      points = DEFAULT_POINTS,
      duration = DEFAULT_DURATION,
      blockDuration = DEFAULT_BLOCK_DURATION,
      keyPrefix,
    } = this.args;
    const { resolve = defaultFieldResolver } = field;
    const rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points,
      duration,
      blockDuration,
      keyPrefix,
    });

    field.resolve = async (...args) => {
      const context = args[2];

      if (context.clientIp && !context.isAdmin) {
        try {
          await rateLimiter.consume(context.clientIp, 1);
        } catch (rejRes) {
          if (rejRes instanceof Error) {
            throw new Error(
              'An unknown error occurred attempting to log your match - please try again'
            );
          }

          throw new Error(
            'You are sending log requests too quickly - please try again later'
          );
        }
      }

      return await resolve.apply(this, args);
    };
  }
}

export const typeDef = gql`
  directive @rateLimit(
    points: Int
    duration: Int
    blockDuration: Int
    keyPrefix: String!
  ) on FIELD_DEFINITION
`;
