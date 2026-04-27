export const validClientId = [
	'members',
	'recurringContributions',
	'jobs',
	'comments',
	'subscriptions',
	'printpromo',
	'web',
] as const;

export type ValidClientId = (typeof validClientId)[number];
