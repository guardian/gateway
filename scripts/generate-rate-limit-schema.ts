import zodToJsonSchema from 'zod-to-json-schema';
import { rateLimiterConfigurationSchema } from '../src/server/lib/rate-limit/configurationValidator';

const jsonSchema = zodToJsonSchema(
  rateLimiterConfigurationSchema,
  'rateLimiterConfigurationSchema',
);

// Output the JSON schema for the rate limiter configuration.
// We use this for autocompletion when editing the rate limit configuration file.
process.stdout.write(JSON.stringify(jsonSchema) + '\n');
