import { ABTest } from '@guardian/ab-core';

export const TEST_ID = 'MarketingConsentImage';

export const marketingConsentImage: ABTest = {
  id: TEST_ID,
  start: '2022-03-23',
  expiry: '2022-03-30',
  author: 'liam.duffy.freelancer@guardian.co.uk',
  description:
    'Testing if presence of image affects marketing consent opt in rates',
  audience: 1,
  audienceOffset: 0,
  successMeasure: 'Understand impact on opt in rates',
  audienceCriteria: 'Half of users will see image in onboarding flow',
  canRun: () => true,
  variants: [
    {
      id: 'image',
      test: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    },
    {
      id: 'no-image',
      test: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    },
  ],
};
