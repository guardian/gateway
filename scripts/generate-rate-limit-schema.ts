import { writeFileSync } from 'node:fs';
import zodToJsonSchema from 'zod-to-json-schema';
import { rateLimiterConfigurationSchema } from '../src/server/lib/rate-limit/configurationValidator';

process.stdout.write('✨  Generating rate limit configuration schema  ✨\n');

// Generate a JSON schema for the rate limiter configuration.
const jsonSchema = zodToJsonSchema(
	rateLimiterConfigurationSchema,
	'rateLimiterConfigurationSchema',
);

// Write the pretty printed JSON schema to .ratelimit.schema.json.
// We use this for autocompletion when editing the rate limit configuration file (and example).
writeFileSync(
	'.ratelimit.schema.json',
	JSON.stringify(jsonSchema, null, 2) + '\n',
);
