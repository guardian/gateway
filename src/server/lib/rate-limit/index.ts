import _rateLimiterConfig from './config';
import rateLimit from './rateLimit';

export * from './types';
export default rateLimit;
export const rateLimiterConfig = _rateLimiterConfig;
