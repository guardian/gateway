const verifiedUserWithNoConsent = {
  status: 'ok',
  user: {
    primaryEmailAddress: 'a.reader@example.com',
    statusFields: {
      userEmailValidated: true,
      allowThirdPartyProfiling: true,
      hasRepermissioned: true,
    },
    consents: [
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
    ],
  },
};

module.exports = {
  verifiedUserWithNoConsent,
};
