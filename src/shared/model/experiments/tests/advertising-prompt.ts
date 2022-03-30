import { ABTest } from '@guardian/ab-core';
export const TEST_ID = 'AdvertisingPermissionRegistrationPrompt';

export const advertisingPromptTest: ABTest = {
  id: TEST_ID,
  start: '2022-05-01', // TODO
  expiry: '2022-06-01', // TODO
  author: 'vlbee',
  description:
    'Test prompting new users to opt in to personalised advertising on the Your Data page',
  audience: 1, // 0.01% (1 is 100%) // TODO
  audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests. // TODO
  successMeasure: 'tbc',
  audienceCriteria: 'New users who have accepted all CMP cookies', // NOTE this check is run clientside in relevant components
  idealOutcome: 'tbc', // TODO
  showForSensitive: true, // Should this A/B test run on sensitive articles?
  canRun: () => true, // Check for things like user or page sections
  variants: [
    {
      id: 'control',
      test: (): string => {
        return 'control';
      },
    },
    {
      id: 'variant-show-ad-permission',
      test: (): string => {
        return 'variant-show-ad-permission';
      },
    },
  ],
};
