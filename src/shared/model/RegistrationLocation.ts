import { z } from 'zod';

export const RegistrationLocation = z.enum([
	'Prefer not to say',
	'United Kingdom',
	'Europe',
	'United States',
	'Canada',
	'Australia',
	'New Zealand',
	'Other',
]);
export type RegistrationLocation = z.infer<typeof RegistrationLocation>;
