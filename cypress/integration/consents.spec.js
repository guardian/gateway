/// <reference types="cypress" />
const ms = require('ms');
const VerifyEmail = require('../support/pages/verify_email');

const allNewsletters = [
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
    id: 'morning-briefing',
    name: 'Morning Briefing: UK',
    theme: 'news',
    description:
      "Breaking down the news stories of the day and telling you why they matter so you’ll be completely up-to-speed. Besides the headlines, you'll get a fantastic lunchtime read and highlights of what’s on the UK’s front pages that morning",
    frequency: 'Every weekday',
    exactTargetListId: 4156,
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
    id: 'morning-mail',
    name: 'Morning Mail: AUS',
    theme: 'news',
    description:
      "Australia's essential news roundup: nation and international headlines, the latest from sport, and the stories we love – both from the Guardian and elsewhere around the web. Plus, it has a few pointers on the day ahead and what to watch out for",
    frequency: 'Every weekday',
    exactTargetListId: 4148,
  },
  {
    id: 'coronavirus-australia-at-a-glance',
    name: 'Coronavirus: Australia at a glance',
    theme: 'news',
    description:
      'Get a weekly summary of the major developments in the coronavirus outbreak across Australia',
    frequency: 'Weekly',
    exactTargetListId: 6007,
  },
  {
    id: 'global-dispatch',
    name: 'Global Dispatch',
    theme: 'news',
    description:
      'Get a different world view: breaking stories and hard-hitting features, uncovered by the Guardian’s global development team and our correspondents across Africa, Asia, South and Central America and beyond. We bring you the voices and opinions of people living under extraordinary circumstances',
    frequency: 'Every other Wednesday',
    exactTargetListId: 4146,
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
    id: 'us-election-australia',
    name: 'US election briefing for Australia',
    theme: 'news',
    description:
      'Your essential roundup of of US election news, from an Australian perspective',
    frequency: 'Weekdays',
    exactTargetListId: 6011,
  },
  {
    id: 'australian-politics',
    name: 'Australian Politics',
    theme: 'news',
    description:
      'All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday',
    frequency: 'Weekdays at 10am',
    exactTargetListId: 4135,
  },
  {
    id: 'business-today',
    name: 'Business Today',
    theme: 'news',
    description:
      "We'll deliver the biggest stories, smartest analysis and hottest topics direct to your inbox. Along with the key news headlines, there’ll be an at-a-glance agenda of the day’s main events, insightful opinion pieces and a quality feature to sink your teeth into",
    frequency: 'Weekday mornings',
    exactTargetListId: 4139,
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
    id: 'lab-notes',
    name: 'Lab Notes',
    theme: 'news',
    description:
      'Science news you’ll want to read. Fact. Sign up to Lab Notes and we’ll email you the top stories in science, from medical breakthroughs to dinosaur discoveries - plus brainteasers, podcasts and more',
    frequency: 'Every Friday',
    exactTargetListId: 4153,
  },
  {
    id: 'documentaries',
    name: 'Guardian Documentaries',
    theme: 'features',
    description:
      'Be the first to find out about our new documentary films, created by top international filmmakers and following unseen global stories. Discover our latest documentaries, get background on our film-makers and the subjects that they cover, and find out about live documentary screenings',
    frequency: 'Whenever a new film is available',
    exactTargetListId: 4149,
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
    id: 'animals-farmed',
    name: 'Animals farmed',
    theme: 'features',
    description:
      'Get a round-up of the best farming and food stories across the world and keep up with our investigation as we track the impact intensive practices and meet those offering sustainable solutions to feed us all.',
    frequency: 'Monthly',
    exactTargetListId: 4222,
  },
  {
    id: 'guns-and-lies-in-america',
    name: 'Guns and Lies in America',
    theme: 'features',
    description:
      'Get the latest from the Guns and Lies in America series. This year-long project explores the dramatic decline in gun violence in one of the most rapidly gentrifying areas of the US.',
    frequency: 'Whenever a new report is published',
    exactTargetListId: 6000,
  },
  {
    id: 'the-upside',
    name: 'The Upside',
    theme: 'features',
    description:
      'Journalism that uncovers real solutions: people, movements and innovations offering answers to our most pressing problems. We’ll round up the best articles for you every week.',
    frequency: 'Weekly',
    exactTargetListId: 4205,
  },
  {
    id: 'this-land-is-your-land',
    name: 'This Land is Your Land',
    theme: 'features',
    description:
      "America's public lands are under threat. Get updates on our two-year series as we cover the challenges facing national parks, forests, deserts, coral reefs and seamounts.",
    frequency: 'Monthly',
    exactTargetListId: 4199,
  },
  {
    id: 'the-recap',
    name: 'The Recap',
    theme: 'sport',
    description:
      'With the best of our sports journalism from the past seven days and a heads-up on the weekend’s action, you won’t miss a thing. Expect stand-out features and interviews, insightful analysis and highlights from the archive, plus films, podcasts, galleries and more.',
    frequency: 'Every Friday',
    exactTargetListId: 4167,
  },
  {
    id: 'the-fiver',
    name: 'The Fiver',
    theme: 'sport',
    description:
      'Kick off your evenings with our football roundup. Sign up to the Fiver, our daily email on the world of football. We’ll deliver the day’s news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way',
    frequency: 'Weekday afternoons',
    exactTargetListId: 4163,
  },
  {
    id: 'the-breakdown',
    name: 'The Breakdown',
    theme: 'sport',
    description:
      'Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style',
    frequency: 'Every Thursday',
    exactTargetListId: 4138,
  },
  {
    id: 'the-spin',
    name: 'The Spin',
    theme: 'sport',
    description:
      'The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over',
    frequency: 'Every Tuesday',
    exactTargetListId: 4169,
  },
  {
    id: 'sports-au',
    name: 'Guardian Australia Sport',
    theme: 'sport',
    description:
      'The latest sports news, features and comment from Guardian Australia, delivered to your inbox each morning',
    frequency: 'Every day',
    exactTargetListId: 4136,
  },
  {
    id: 'sleeve-notes',
    name: 'Sleeve Notes',
    theme: 'culture',
    description:
      'Every genre, every era, every week. Get music news, bold reviews and unexpected extras emailed direct to you from the Guardian’s music desk',
    frequency: 'Every Friday',
    exactTargetListId: 4159,
  },
  {
    id: 'film-today',
    name: 'Film Today',
    theme: 'culture',
    description:
      'Sign up to the Guardian Film Today email and we’ll make sure you don’t miss a thing - the day’s insider news and our latest reviews, plus big name interviews and film festival coverage',
    frequency: 'Every weekday',
    exactTargetListId: 4144,
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
  {
    id: 'art-weekly',
    name: 'Art Weekly',
    theme: 'culture',
    description:
      'For your art world low-down, sign up to the Guardian’s Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox',
    frequency: 'Every Friday',
    exactTargetListId: 4134,
  },
  {
    id: 'hear-here',
    name: 'Hear Here',
    theme: 'culture',
    description:
      'Discover new audio delights with a weekly selection of must-listen podcasts, hand-picked by Guardian staff and by our readers. Sign up and we’ll send you a weekly email full of hidden gems',
    frequency: 'Every Friday',
    exactTargetListId: 4104,
  },
  {
    id: 'design-review',
    name: 'Design Review',
    theme: 'lifestyle',
    description:
      'Get a dose of creative inspiration. Expect original, sustainable ideas and reflection from designers and crafters, along with clever, beautiful products for smarter living',
    frequency: 'Monthly',
    exactTargetListId: 6010,
  },
  {
    id: 'the-flyer',
    name: 'The Flyer',
    theme: 'lifestyle',
    description:
      'Weekly travel inspiration. Off-piste attractions, budget breaks, top 10s and reader reviews. Uncover unconventional destinations and rediscover old favourites - let our travel editors guide you to trips worth taking',
    frequency: 'Every Monday',
    exactTargetListId: 4164,
  },
  {
    id: 'fashion-statement',
    name: 'Fashion Statement',
    theme: 'lifestyle',
    description:
      'A weekly hit of style with substance. Smart fashion writing and chic shopping galleries delivered straight to your inbox. Sign up for our Friday email for the best of the week’s fashion brought to you with expertise, humour and irreverence',
    frequency: 'Every Friday',
    exactTargetListId: 4143,
  },
  {
    id: 'the-guide-staying-in',
    name: 'The Guide: staying in',
    theme: 'lifestyle',
    description:
      'Entertainment delivered straight to your sofa. We hand-pick the best TV and box sets to binge on, games to get lost in - plus podcasts, books, music and more',
    frequency: 'Weekly',
    exactTargetListId: 6006,
  },
  {
    id: 'saved-for-later',
    name: 'Saved for Later',
    theme: 'lifestyle',
    description:
      "Catch up on the fun stuff with this rundown of must-reads, pop culture, trends and tips for the weekend – from Guardian Australia's culture and lifestyle editors.",
    frequency: 'Weekly',
    exactTargetListId: 6003,
  },
  {
    id: 'word-of-mouth',
    name: 'Word of Mouth',
    theme: 'lifestyle',
    description:
      'Get a weekly taste of our best food writing, including the latest recipes from our star cooks. Plus we’ll bring you seasonal eating inspiration from our archive and our must-read restaurant reviews.',
    frequency: 'Weekly',
    exactTargetListId: 6002,
  },
  {
    id: 'best-of-opinion',
    name: 'Best of Guardian Opinion: UK',
    theme: 'comment',
    description:
      'Get out of your bubble. See things from another point of view - join the debate and you might even change your mind. Sign up to have the Guardian’s best opinion pieces emailed to you every weekday afternoon',
    frequency: 'Weekday afternoons',
    exactTargetListId: 4161,
  },
  {
    id: 'this-is-europe',
    name: 'This is Europe',
    theme: 'comment',
    description:
      'Be part of the European conversation and keep track of what’s exciting the region as our international contributors share their views, hopes and challenges.',
    frequency: 'Weekly',
    exactTargetListId: 4234,
  },
  {
    id: 'best-of-opinion-us',
    name: 'Best of Guardian Opinion: US',
    theme: 'comment',
    description:
      'Keep up on today’s pressing issues with the Guardian’s Best of Opinion US email. We’ll send the most shared opinion, analysis and editorial articles from the last 24 hours, every weekday, direct to your inbox',
    frequency: 'Weekday afternoons',
    exactTargetListId: 4162,
  },
  {
    id: 'patriarchy',
    name: 'The Week in Patriarchy',
    theme: 'comment',
    description:
      'Each week, Arwa Mahdawi recaps the most important stories on feminism and sexism',
    frequency: 'Weekly',
    exactTargetListId: 4170,
  },
  {
    id: 'best-of-opinion-au',
    name: 'Best of Guardian Opinion: AUS',
    theme: 'comment',
    description:
      'An evening selection of the best reads from Guardian Opinion in Australia',
    frequency: 'Daily',
    exactTargetListId: 4160,
  },
  {
    id: 'first-dog',
    name: 'First Dog on the Moon',
    theme: 'comment',
    description:
      'Subscribe to First Dog on the Moon to get his cartoons straight to your inbox every time they’re published',
    frequency: 'About three times a week',
    exactTargetListId: 4145,
  },
  {
    id: 'business-to-business',
    name: 'Business to Business',
    theme: 'work',
    description:
      'Sign up for Business View for weekly news and advice to help firms grow, Essential reading for SMEs, entrepreneurs, owners, employees and advisers.',
    frequency: 'Every other Thursday',
    exactTargetListId: 4207,
  },
  {
    id: 'guardian-students',
    name: 'Guardian Students',
    theme: 'work',
    description:
      'We lift the lid on student life. Join us for news, views and advice on everything from course choices to gender politics, from student societies to tips for tenants.',
    frequency: 'Monthly',
    exactTargetListId: 4214,
  },
  {
    id: 'higher-education-network',
    name: 'Guardian Universities',
    theme: 'work',
    description:
      'With agenda-setting news and commentary for university staff and academics, our newsletter brings your great articles and the cream of Guardian Jobs listings.',
    frequency: 'Every Friday',
    exactTargetListId: 4210,
  },
  {
    id: 'society-weekly',
    name: 'Society Weekly',
    theme: 'work',
    description:
      'Weekly bulletin for professionals working in public services, with insight on issues including innovation and tech, policy, practice and joint working.',
    frequency: 'Every Wednesday',
    exactTargetListId: 4281,
  },
  {
    id: 'teacher-network',
    name: 'Teacher Network',
    theme: 'work',
    description:
      'Catch up on the week’s teaching news and highlights from our network, plus the pick of Guardian Jobs listings for educators.',
    frequency: 'Every Sunday',
    exactTargetListId: 4208,
  },
  {
    id: 'the-weekend-papers',
    name: 'The Weekend Papers',
    theme: 'From the papers',
    description:
      "A weekly preview of what's coming up in the Saturday Guardian and The Observer – plus competitions and discounts - delivered every Friday.",
    frequency: 'Weekly',
    exactTargetListId: 4279,
  },
  {
    id: 'observer-food',
    name: 'The Observer Food Monthly',
    theme: 'From the papers',
    description:
      'Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions',
    frequency: 'Monthly',
    exactTargetListId: 4157,
  },
];

const userNewsletters = {
  result: {
    htmlPreference: 'HTML',
    subscriptions: [],
    globalSubscriptionStatus: 'opted_in',
  },
  status: 'ok',
};

const fakeSuccessResponse = {
  cookies: {
    values: [
      {
        key: 'GU_U',
        value: 'FAKE_GU_U',
      },
      {
        key: 'SC_GU_LA',
        value: 'FAKE_SC_GU_LA',
        sessionCookie: true,
      },
      {
        key: 'SC_GU_U',
        value: 'FAKE_SC_GU_U',
      },
    ],
    expiresAt: ms('30d') * 1000,
  },
};

const fakeSuccessAuth = {
  signInStatus: 'signedInRecently',
  emailValidated: true,
  redirect: null,
};

describe('Consents flow', () => {
  const verifyEmailFlow = new VerifyEmail();

  before(() => {
    cy.idapiMockPurge();
  });

  context('Verify email', () => {
    it.only('successfuly verifies the email using a token and sets auth cookies', () => {
      // mock validation success response (200 with auth cookies)
      cy.idapiMock(200, fakeSuccessResponse);

      // set these cookies manually
      // TODO: can cypress set the automatically?
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');
      cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');

      // set successful auth using login middleware
      cy.idapiMock(200, fakeSuccessAuth);

      // all newsletters mock response
      cy.idapiMock(200, allNewsletters);

      // user newsletters mock response
      cy.idapiMock(200, userNewsletters);

      // go to verify email endpoint
      verifyEmailFlow.goto('avalidtoken');

      // check if verified email text exists
      cy.contains(VerifyEmail.CONTENT.EMAIL_VERIFIED);
    });

    // it.todo('verification token is expired shows page to resend email');

    // it.todo('verification token is invalid shows page to resend email');
  });
});
