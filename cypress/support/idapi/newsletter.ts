export const NEWSLETTER_ENDPOINT = '/newsletters';
export const NEWSLETTER_SUBSCRIPTION_ENDPOINT = '/users/me/newsletters';

export const NEWSLETTER_ERRORS = {
  GENERIC:
    'There was a problem displaying newsletter options, please try again.',
};

export const allNewsletters = [
  {
    id: 'today-uk',
    name: 'Guardian Today: UK',
    theme: 'news',
    description:
      'The headlines, the analysis, the debate. Get the whole picture from a source you trust, emailed to you every morning. The biggest stories examined, and diverse, independent views - the Guardian Today delivers the best of our journalism',
    frequency: 'Every day',
    exactTargetListId: 4151,
  },
  {
    id: 'today-us',
    name: 'Guardian Today: US',
    theme: 'news',
    description:
      'Cut through the noise. Get straight to the heart of the day’s breaking news in double-quick time with the Guardian Today. We’ll email you the stories you need to read, and bundle them up with the best of sport, culture, lifestyle and more',
    frequency: 'Every weekday',
    exactTargetListId: 4152,
  },
  {
    id: 'today-au',
    name: 'Guardian Today: AUS',
    theme: 'news',
    description:
      "Our editors’ picks for the day's top news and commentary delivered to your inbox each weekday",
    frequency: 'Every weekday',
    exactTargetListId: 4150,
  },
  {
    id: 'us-morning-newsletter',
    name: 'First Thing: the US morning briefing',
    theme: 'news',
    description:
      "Stay informed with a summary of the top stories from the US and the day's must-reads from across the Guardian",
    frequency: 'Every weekday',
    exactTargetListId: 4300,
  },
  {
    id: 'minute-us',
    name: 'Fight to Vote',
    theme: 'news',
    description:
      'The US could face the biggest ballot brawl in its history this November – stay informed about election integrity and voting rights in the 2020 election',
    frequency: 'Weekly',
    exactTargetListId: 4166,
  },
  {
    id: 'green-light',
    name: 'Green Light',
    theme: 'news',
    description:
      'In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We’ll also flag up our best video, picture galleries, podcasts, blogs and green living guides',
    frequency: 'Weekly',
    exactTargetListId: 4147,
  },
  {
    id: 'the-long-read',
    name: 'The Long Read',
    theme: 'features',
    description:
      'Get lost in a great story. From politics to fashion, international investigations to new thinking, culture to crime - we’ll bring you the biggest ideas and the arguments that matter. Sign up to have the Guardian’s award-winning long reads emailed to you every Saturday morning',
    frequency: 'Every Saturday',
    exactTargetListId: 4165,
  },
  {
    id: 'bookmarks',
    name: 'Bookmarks',
    theme: 'culture',
    description:
      'Join us in the world of books. Discover new books with our expert reviews, author interviews and top 10s, plus enjoy highlights from our columnists and community. Kick back on a Sunday with our weekly email full of literary delights',
    frequency: 'Every Sunday',
    exactTargetListId: 4137,
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
