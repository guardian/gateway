import { ABTest } from '@guardian/ab-core';

export const TEST_ID = 'OnboardingNewslettersTest';
export const CONTROL_VARIANT = 'control';
export const TEST_VARIANT = 'test';

export const onboardingNewslettersTest: ABTest = {
  id: TEST_ID,
  // TODO: change start / expiry before release
  start: '2020-12-16',
  expiry: '2020-12-31',
  author: 'liam.duffy.freelancer@guardian.co.uk',
  description: 'Testing alternative newsletter options in onboarding flow',
  audience: 1,
  audienceOffset: 0,
  successMeasure: 'Understand impact on opt in rates',
  audienceCriteria:
    'Half of users viewing consent flow will see test newsletter options',
  canRun: () => true,
  variants: [
    {
      id: CONTROL_VARIANT,
      test: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    },
    {
      id: TEST_VARIANT,
      test: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    },
  ],
};
