import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { gql } from 'apollo-server-express';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

import { redisClient } from '../../../common/services';

const DEFAULT_POINTS = 5; // p consumable points every 30 seconds
const DEFAULT_DURATION = 30; // Every d seconds
const DEFAULT_BLOCK_DURATION = 3600; // Block requests if limited

export const rateLimitDirective = (directiveName: string) => ({
  rateLimitDirectiveTypeDef: gql`
    directive @${directiveName}(
      points: Int
      duration: Int
      blockDuration: Int
      keyPrefix: String!
    ) on FIELD_DEFINITION
  `,
  rateLimitDirectiveTransformer: (schema: GraphQLSchema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const rateLimitDirective = getDirective(
          schema,
          fieldConfig,
          directiveName
        );

        if (rateLimitDirective) {
          const {
            points = DEFAULT_POINTS,
            duration = DEFAULT_DURATION,
            blockDuration = DEFAULT_BLOCK_DURATION,
            keyPrefix,
          } = fieldConfig.args as any;
          const rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            points,
            duration,
            blockDuration,
            keyPrefix,
          });
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async (...args) => {
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
          return fieldConfig;
        }
      },
    }),
});
