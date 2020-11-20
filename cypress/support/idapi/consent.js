/// <reference types="cypress" />

const allConsents = [
  {
    id: 'sms',
    isOptOut: false,
    isChannel: true,
    name: 'SMS',
    description:
      "I would like to receive updates about The Guardian products and services I've selected above by SMS (text messages).",
  },
  {
    id: 'holidays',
    isOptOut: false,
    isChannel: false,
    name: 'Holidays & Vacations',
    description:
      'Ideas and inspiration for your next trip away, as well as the latest offers from Guardian Holidays in the UK and Guardian Vacations in the US.',
  },
  {
    id: 'market_research_optout',
    isOptOut: true,
    isChannel: false,
    name: 'Market Research Optout',
    description:
      'I do NOT wish to be contacted by The Guardian for market research purposes.',
  },
  {
    id: 'offers',
    isOptOut: false,
    isChannel: false,
    name: 'Offers',
    description:
      'Offers and competitions from The Guardian and other carefully selected and trusted partners that we think you might like. Don’t worry, we won’t share your personal information with them. Available in the UK, Aus and US.',
  },
  {
    id: 'post_optout',
    isOptOut: true,
    isChannel: false,
    name: 'Post Optout',
    description:
      'I do NOT wish to receive communications from The Guardian by post.',
  },
  {
    id: 'profiling_optout',
    isOptOut: true,
    isChannel: false,
    name: 'Profiling Optout',
    description:
      'I do NOT want The Guardian to use my personal data for marketing analysis.',
  },
  {
    id: 'phone_optout',
    isOptOut: true,
    isChannel: true,
    name: 'Telephone Optout',
    description:
      'I do NOT wish to receive communications from The Guardian by telephone.',
  },
  {
    id: 'supporter',
    isOptOut: false,
    isChannel: false,
    name: 'Subscriptions, membership and contributions',
    description:
      'News and offers from The Guardian, The Observer and Guardian Weekly, on the ways to read and support our journalism. Already a member, subscriber or contributor? Opt in here to receive your regular emails and updates.',
  },
  {
    id: 'jobs',
    isOptOut: false,
    isChannel: false,
    name: 'Jobs',
    description:
      'Receive tips, Job Match recommendations, and advice from Guardian Jobs on taking your next career step.',
  },
  {
    id: 'events',
    isOptOut: false,
    isChannel: false,
    name: 'Events & Masterclasses',
    description:
      'Learn from leading minds at our Guardian live events, including discussions and debates, short courses and bespoke training. Available in the UK, Aus and US.',
  },
];

const defaultUserConsent = [
  {
    id: 'sms',
    consented: false,
  },
  {
    id: 'post_optout',
    consented: false,
  },
  {
    id: 'phone_optout',
    consented: false,
  },
  {
    id: 'profiling_optout',
    consented: false,
  },
  {
    id: 'market_research_optout',
    consented: false,
  },
  {
    id: 'supporter',
    consented: false,
  },
  {
    id: 'jobs',
    consented: false,
  },
  {
    id: 'holidays',
    consented: false,
  },
  {
    id: 'events',
    consented: false,
  },
  {
    id: 'offers',
    consented: false,
  },
];

const optedOutUserConsent = [
  {
    id: 'sms',
    consented: false,
  },
  {
    id: 'post_optout',
    consented: false,
  },
  {
    id: 'phone_optout',
    consented: false,
  },
  {
    id: 'profiling_optout',
    consented: true,
  },
  {
    id: 'market_research_optout',
    consented: true,
  },
  {
    id: 'supporter',
    consented: false,
  },
  {
    id: 'jobs',
    consented: false,
  },
  {
    id: 'holidays',
    consented: false,
  },
  {
    id: 'events',
    consented: false,
  },
  {
    id: 'offers',
    consented: false,
  },
];

module.exports = {
  allConsents,
  optedOutUserConsent,
  defaultUserConsent,
};
