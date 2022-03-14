import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';

const { redis } = getConfiguration();

export default new Redis({
  host: redis.host,
  password: redis.password,
});
