import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';

const { redis, rateLimiter, stage } = getConfiguration();

export default rateLimiter.enabled
  ? new Redis({
      host: redis.host,
      password: redis.password,
      tls: stage === 'DEV' ? undefined : {},
    })
  : undefined;
