import { ABTest } from '@guardian/ab-core';

export const abSimplifyRegistrationFlowTest: ABTest = {
	id: 'SimplifyRegistrationFlowTest', // This ID must match the Server Side AB Test
	start: '2023-08-01',
	expiry: '2023-09-30', // Remember that the server side test expiry can be different
	author: 'Personalisation',
	description: '',
	audience: 0.5,
	audienceOffset: 0,
	successMeasure:
		'We believe that shortening the onboarding flow by having 3 steps rather than 4 will increase the completion rate of registration by X%',
	audienceCriteria: '50% of the audience',
	idealOutcome: 'Increase of completion of the registration flow',
	showForSensitive: true, // Should this A/B test run on sensitive articles?
	canRun: () => true, // Check for things like user or page sections
	variants: [
		{
			id: 'variant', // toggle is on
			test: (): string => {
				return 'variant';
			},
		},
	],
};
