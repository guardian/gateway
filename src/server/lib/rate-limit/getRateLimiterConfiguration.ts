import { existsSync, readFileSync } from 'fs';
import * as Joi from 'joi';

import type {
  BucketConfiguration,
  RateLimitBucketsConfiguration,
  RateLimiterConfiguration,
} from './types';

const checkedJoiObject = <TSchema>(schema: {
  [key in keyof TSchema]: Joi.SchemaLike | Joi.SchemaLike[];
}) => Joi.object<TSchema>(schema);

const bucketConfigObject = checkedJoiObject<BucketConfiguration>({
  capacity: Joi.number().required(),
  addTokenMs: Joi.number().required(),
  maximumTimeBeforeTokenExpiry: Joi.number().optional(),
});

const bucketsConfigObject = checkedJoiObject<RateLimitBucketsConfiguration>({
  globalBucket: bucketConfigObject.required(),
  accessTokenBucket: bucketConfigObject.optional(),
  ipBucket: bucketConfigObject.optional(),
  emailBucket: bucketConfigObject.optional(),
  oktaIdentifierBucket: bucketConfigObject.optional(),
});

const schema = checkedJoiObject<RateLimiterConfiguration>({
  enabled: Joi.boolean().required(),
  defaultBuckets: bucketsConfigObject.required(),
  routeBuckets: Joi.object()
    .pattern(Joi.string(), bucketsConfigObject)
    .optional(),
});

const validateRateLimiterConfiguration = (configuration: unknown) =>
  schema.validate(configuration);

const tryReadConfigFile = () => {
  if (existsSync('.ratelimit.json')) {
    const configJson = readFileSync('.ratelimit.json', 'utf-8');
    if (configJson) {
      return JSON.parse(configJson);
    }
  }
};

const tryReadEnvironmentVariable = () => {
  const configJson = process.env.RATE_LIMITER_CONFIG || '';
  if (configJson) {
    return JSON.parse(configJson);
  }
};

const getRateLimiterConfiguration = () => {
  const unvalidatedConfig = tryReadEnvironmentVariable() ?? tryReadConfigFile();

  if (typeof unvalidatedConfig === 'undefined') {
    throw Error('Rate limiter configuration missing or malformed');
  }

  const { error, value } = validateRateLimiterConfiguration(unvalidatedConfig);

  if (error) {
    throw error;
  }

  return value;
};

export default getRateLimiterConfiguration;
