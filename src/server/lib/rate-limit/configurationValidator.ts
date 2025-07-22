import { z } from 'zod';
import { ValidRoutePathsArray } from '../../../shared/model/Routes';

export const bucketSchema = z
	.object({
		capacity: z.number(),
		addTokenMs: z.number(),
		maximumTimeBeforeTokenExpiry: z.number().optional(),
	})
	.strict();

const settingsConfigurationSchema = z
	.object({
		logOnly: z.boolean().optional(),
		trackBucketCapacity: z.boolean().optional(),
	})
	.strict();

const routeBucketSettingsConfigurationSchema = z
	.object({
		logOnly: z.boolean().optional(),
	})
	.strict();

export const routeBucketsConfigurationSchema = z
	.object({
		enabled: z.boolean().optional(),
		settings: routeBucketSettingsConfigurationSchema.optional(),
		globalBucket: bucketSchema,
		accessTokenBucket: bucketSchema.optional(),
		ipBucket: bucketSchema.optional(),
		emailBucket: bucketSchema.optional(),
		oktaIdentifierBucket: bucketSchema.optional(),
	})
	.strict();

export const rateLimiterConfigurationSchema = z
	.object({
		enabled: z.boolean(),
		settings: settingsConfigurationSchema.optional(),
		defaultBuckets: routeBucketsConfigurationSchema,
		routeBuckets: z
			.partialRecord(
				z.enum(ValidRoutePathsArray),
				routeBucketsConfigurationSchema,
			)
			.optional(),
	})
	.strict();

const validateRateLimiterConfiguration = (configuration: unknown) =>
	typeof configuration === 'undefined'
		? undefined
		: rateLimiterConfigurationSchema.safeParse(configuration);

export default validateRateLimiterConfiguration;
