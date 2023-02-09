import { ABTest } from '@guardian/ab-core';

export const abDefaultWeeklyNewsletterTest: ABTest = {
  id: 'DefaultWeeklyNewsletterTest', // This ID must match the Server Side AB Test
  start: '2023-01-04',
  expiry: '2023-02-30', // Remember that the server side test expiry can be different
  author: 'Personalisation',
  description:
    'How successful a default opt in newsletter could be in the registration onboarding journey',
  audience: 0.35,
  audienceOffset: 0,
  successMeasure:
    'An email open rate of over 20% and an unsubscribe rate of under 4%',
  audienceCriteria:
    '35% of onboarding flow traffic over one week, limited to US, UK and AU',
  idealOutcome:
    'Success measure plus look at customer feedback, impact on deliverability and impact on supporter consent opt in as secondary measures',
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
