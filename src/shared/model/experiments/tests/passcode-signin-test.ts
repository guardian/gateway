import { ABTest } from '@guardian/ab-core';

export const passcodeSignInTest: ABTest = {
	id: 'PasscodeSignInTest', // This ID must match the Server Side AB Test
	start: '2025-01-13',
	expiry: '2025-01-31', // Remember that the server side test expiry can be different
	author: 'mahesh.makani@theguardian.com',
	description:
		'Testing the release of one time passcodes as the default sign in option',
	audience: 0.1, // 10% (1 is 100%)
	audienceOffset: 0, // 0% (1 is 100%). Prevent overlapping with other tests.
	successMeasure: 'Users sign in successfully with passcodes',
	audienceCriteria: 'Everyone',
	idealOutcome: 'Users sign in successfully with passcodes',
	showForSensitive: true, // Should this A/B test run on sensitive articles?
	canRun: () => true, // Check for things like user or page sections
	variants: [
		{
			id: 'variant',
			test: (): string => {
				return 'variant';
			},
		},
	],
};
