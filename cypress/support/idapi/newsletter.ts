export const NEWSLETTER_ENDPOINT = '/newsletters';
export const NEWSLETTER_SUBSCRIPTION_ENDPOINT = '/users/me/newsletters';

export const NEWSLETTER_ERRORS = {
  GENERIC:
    'There was a problem displaying newsletter options, please try again.',
};

export const allNewsletters = [
  {
    id: 'morning-mail',
    name: "Guardian Australia's Morning Mail",
    description:
      'Our Australian morning briefing email breaks down the key national and international stories of the day and why they matter',
    frequency: 'Every weekday',
    exactTargetListId: 4148,
  },
  {
    id: 'morning-briefing',
    name: 'Guardian Morning Briefing',
    description:
      'Start the day one step ahead. Our email breaks down the key stories of the day and why they matter',
    frequency: 'Every weekday',
    exactTargetListId: 4156,
  },
  {
    id: 'us-morning-newsletter',
    name: 'First Thing: the US morning briefing',
    description:
      "Stay informed with a summary of the top stories from the US and the day's must-reads from across the Guardian",
    frequency: 'Every weekday',
    exactTargetListId: 4300,
  },
  {
    id: 'green-light',
    name: 'Green Light',
    description:
      'In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We’ll also flag up our best video, picture galleries, podcasts, blogs and green living guides',
    frequency: 'Weekly',
    exactTargetListId: 4147,
  },
  {
    id: 'the-long-read',
    name: 'The Long Read',
    description:
      'Get lost in a great story. From politics to fashion, international investigations to new thinking, culture to crime - we’ll bring you the biggest ideas and the arguments that matter. Sign up to have the Guardian’s award-winning long reads emailed to you every Saturday morning',
    frequency: 'Every Saturday',
    exactTargetListId: 4165,
  },
  {
    id: 'the-guide-staying-in',
    name: 'The Guide',
    description:
      'Home entertainment tips delivered straight to your sofa. The best TV and box sets, games, podcasts, books and more',
    frequency: 'Weekly',
    listIdV1: -1,
    exactTargetListId: 6006,
  },
];

export const userNewsletters = (
  subscriptions: Array<{ listId: number }> = [],
) => {
  return {
    result: {
      htmlPreference: 'HTML',
      subscriptions,
      globalSubscriptionStatus: 'opted_in',
    },
    status: 'ok',
  };
};
