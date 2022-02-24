import { ABTest } from '@guardian/ab-core';

export const TEST_ID = 'OptInPromptPostSignIn';

export const optInPrompt: ABTest = {
  id: TEST_ID,
  start: '2022-01-01',
  expiry: '2022-12-31',
  author: 'liam.duffy.freelancer@guardian.co.uk',
  description:
    'Testing prompting users to opt in to newsletter / marketing after sign in',
  audience: 0.1,
  audienceOffset: 0,
  successMeasure: 'Understand impact on opt in rates',
  audienceCriteria:
    'Half of users viewing consent flow will see prompt after signing in',
  canRun: () => true,
  variants: [
    {
      id: 'only-variant',
      test: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    },
  ],
};
