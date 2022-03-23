import rateLimit from './rateLimit';

import { RateLimiterConfiguration as _RateLimiterConfiguration } from './validateConfiguration';

export type RateLimiterConfiguration = _RateLimiterConfiguration;

export * from './types';
export default rateLimit;
