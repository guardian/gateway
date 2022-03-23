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

const rateLimiteronfigurationSchema = z.object({
  enabled: z.boolean(),
  defaultBuckets: bucketsSchema,
  routeBuckets: z
    .record(z.enum(ValidRoutePathsArray), bucketsSchema)
    .optional(),
});

const validateRateLimiterConfiguration = (configuration: unknown) =>
  rateLimiteronfigurationSchema.safeParse(configuration);

export type RateLimiterConfiguration = z.infer<
  typeof rateLimiteronfigurationSchema
>;

export default validateRateLimiterConfiguration;
