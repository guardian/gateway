import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';

import rateLimiter from '../rate-limit/config';

const { redis } = getConfiguration();

export default rateLimiter.enabled
  ? new Redis({
      host: redis.host,
      password: redis.password,
    })
  : undefined;
