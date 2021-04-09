import { ABTest } from '@guardian/ab-core';

export const singleNewsletterTest: ABTest = {
  id: 'SingleNewsletterTest', // This ID must match the Server Side AB Test
  start: '2021-04-09',
  expiry: '2021-05-09', // Remember that the server side test expiry can be different
  author: 'mahesh.makani@theguardian.com',
  description:
    'We believe that if we show a single newsletter, vs 4, it will increase opt in to at least one newsletter. . We think it will increase by at least 7.5%',
  audience: 1, // 0.01% (1 is 100%)
  audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests.
  successMeasure: 'Various',
  audienceCriteria:
    'Half the audience using the consents flow to see single newsletter',
  idealOutcome: 'More users opted in to single newsletter',
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
