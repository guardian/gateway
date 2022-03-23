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

export default validateRateLimiterConfiguration;
