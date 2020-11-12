class ReviewPage {
  static URL = '/consents/review';
  static CONTENT = {
    NEWSLETTERS: {
      TODAY_UK: 'Guardian Today: UK',
      LONG_READ: 'The Long Read',
      GREEN_LIGHT: 'Green Light',
      BOOKMARKS: 'Bookmarks',
    },
    CONSENT: {
      SUBSCRIPTIONS: 'Subscriptions, membership and contributions',
      JOBS: 'Jobs',
      HOLIDAYS: 'Holidays & Vacations',
      EVENTS: 'Events & Masterclasses',
      OFFERS: 'Offers',
    },
    CONSENT_OPTOUT: {
      RESEARCH: 'Marketing research',
      ANALYSIS: 'Marketing analysis',
    },
  };
}

module.exports = ReviewPage;
