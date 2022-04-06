import { z } from 'zod';
import { ValidRoutePathsArray } from '@/shared/model/Routes';

const bucketSchema = z.object({
  capacity: z.number(),
  addTokenMs: z.number(),
  maximumTimeBeforeTokenExpiry: z.number().optional(),
});

const bucketsSchema = z.object({
  globalBucket: bucketSchema,
  accessTokenBucket: bucketSchema.optional(),
  ipBucket: bucketSchema.optional(),
  emailBucket: bucketSchema.optional(),
  oktaIdentifierBucket: bucketSchema.optional(),
});

const routeBucketConfigurationSchema = z.object({});

const rateLimiterConfigurationSchema = z
  .object({
    enabled: z.boolean(),
    defaultBuckets: bucketsSchema,
    routeBuckets: z
      .record(z.enum(ValidRoutePathsArray), bucketsSchema)
      .optional(),
  })
  .strict();

const validateRateLimiterConfiguration = (configuration: unknown) =>
  typeof configuration === 'undefined'
    ? undefined
    : rateLimiterConfigurationSchema.safeParse(configuration);

export type RateLimiterConfiguration = z.infer<
  typeof rateLimiterConfigurationSchema
>;

export default validateRateLimiterConfiguration;
