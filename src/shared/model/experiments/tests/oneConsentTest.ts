import { ABTest } from '@guardian/ab-core';

export const oneConsentTest: ABTest = {
  id: 'oneConsentTest', // This ID must match the Server Side AB Test
  start: '2020-12-14',
  expiry: '2021-01-11', // Remember that the server side test expiry can be different
  author: 'patrick.orrell@theguardian.com',
  description:
    'Testing the effect of having just one consent on the communications page',
  audience: 0.5, // 0.01% (1 is 100%)
  audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests.
  successMeasure: 'Various',
  audienceCriteria: 'Half the audience using the consents flow',
  idealOutcome: 'Various',
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
      id: 'variant',
      test: (): string => {
        return 'variant';
      },
    },
  ],
};
