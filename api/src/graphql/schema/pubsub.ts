import { RedisPubSub } from 'graphql-redis-subscriptions';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../../common/config';

export const pubsub = new RedisPubSub({
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  },
});
