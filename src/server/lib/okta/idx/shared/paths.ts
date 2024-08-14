// Okta IDX API paths
const idxPaths = [
	'challenge',
	'challenge/answer',
	'challenge/resend',
	'credential/enroll',
	'enroll',
	'enroll/new',
	'identify',
	'introspect',
	'recover',
] as const;
export type IDXPath = (typeof idxPaths)[number];
