import { ABTest } from '@guardian/ab-core';

export const exampleTest: ABTest = {
	id: 'ExampleTest', // This ID must match the Server Side AB Test
	start: '2020-05-20',
	expiry: '2020-12-01', // Remember that the server side test expiry can be different
	author: 'anemailaddress@theguardian.com',
	description: 'This Test',
	audience: 0.0001, // 0.01% (1 is 100%)
	audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests.
	successMeasure: 'It works',
	audienceCriteria: 'Everyone',
	idealOutcome: 'It works',
	showForSensitive: true, // Should this A/B test run on sensitive articles?
	canRun: () => true, // Check for things like user or page sections
	variants: [
		{
			id: 'control',
			test: (): string => {
				// You can define what you want your variant to do in here or use the isUserInVariant API
				return 'control';
			},
		},
		{
			id: 'variant',
			test: (): string => {
				return 'variant';
			},
		},
	],
};
