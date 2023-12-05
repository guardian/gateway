import { z } from 'zod';

export const RegistrationLocationSchema = z.enum([
	'Prefer not to say',
	'United Kingdom',
	'Europe',
	'United States',
	'Canada',
	'Australia',
	'New Zealand',
	'Other',
]);

export type RegistrationLocation = z.infer<typeof RegistrationLocationSchema>;
