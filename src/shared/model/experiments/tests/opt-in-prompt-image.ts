import { ABTest } from '@guardian/ab-core';

export const TEST_ID = 'OptInPromptPostSignInImage';

export const optInPromptImage: ABTest = {
  id: TEST_ID,
  start: '2022-03-15',
  expiry: '2022-03-21',
  author: 'liam.duffy.freelancer@guardian.co.uk',
  description:
    'Testing if presence of image affects opt in rates on post sign in prompt',
  audience: 1,
  audienceOffset: 0,
  successMeasure: 'Understand impact on opt in rates',
  audienceCriteria: 'Half of users will see image on opt in prompt',
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
