import IORedis from 'ioredis';
import { redisClient } from '../../common/services';

export const MATCH_SENSITIVE_CACHE_PREFIX = 'match';

export const deleteKeysByPattern = (key: string) => {
  const stream = redisClient.scanStream({
    match: key,
    count: 100,
  });

  const keys = [] as IORedis.KeyType[];
  stream.on('data', (resultKeys) => {
    for (let i = 0; i < resultKeys.length; i++) {
      keys.push(resultKeys[i]);
    }
  });
  stream.on('end', function () {
    redisClient.unlink(keys);
  });
};
