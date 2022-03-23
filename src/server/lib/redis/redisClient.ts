import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';

const { redis, rateLimiter } = getConfiguration();

export default rateLimiter.enabled
  ? new Redis({
      host: redis.host,
      password: redis.password,
      tls: redis.sslOn ? {} : undefined,
    })
  : undefined;
