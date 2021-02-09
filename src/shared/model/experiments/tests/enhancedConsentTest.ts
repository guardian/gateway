import { ABTest } from '@guardian/ab-core';

export const enhancedConsentTest: ABTest = {
  id: 'EnhancedConsentTest', // This ID must match the Server Side AB Test
  start: '2021-02-09',
  expiry: '2021-03-28', // Remember that the server side test expiry can be different
  author: 'patrick.orrell@theguardian.com',
  description:
    'Testing the effect of having an enhanced consent design and a simplified header on user consents',
  audience: 1, // 0.01% (1 is 100%)
  audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests.
  successMeasure: 'Various',
  audienceCriteria: 'Half the audience using the consents flow',
  idealOutcome: 'Various',
  showForSensitive: true, // Should this A/B test run on sensitive articles?
  canRun: () => true, // Check for things like user or page sections
  variants: [
    {
      id: 'control',
      test: (): void => {
        return;
      },
    },
    {
      id: 'variant',
      test: (): void => {
        return;
      },
    },
  ],
};
