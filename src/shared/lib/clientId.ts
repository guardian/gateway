export const validClientId = [
	'members',
	'recurringContributions',
	'jobs',
	'comments',
	'subscriptions',
	'printpromo',
] as const;

export type ValidClientId = (typeof validClientId)[number];
