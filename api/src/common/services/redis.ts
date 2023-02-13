import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../config';

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  family: process.env.REDIS_FAMILY ? parseInt(process.env.REDIS_FAMILY) : 4,
});

export default redisClient;
