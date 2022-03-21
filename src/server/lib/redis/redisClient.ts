import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';

const { redis, rateLimiter, isHttps, stage } = getConfiguration();

export default rateLimiter.enabled
  ? new Redis({
      host: redis.host,
      password: redis.password,
      tls: isHttps && stage !== 'DEV' ? {} : undefined,
    })
  : undefined;
