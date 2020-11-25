const { defaultUserConsent } = require('./consent');

const USER_ENDPOINT = '/user/me';

const USER_ERRORS = {
  GENERIC: 'There was a problem retrieving your details, please try again.',
};

const createUser = (consents = defaultUserConsent) => ({
  status: 'ok',
  user: {
    primaryEmailAddress: 'a.reader@example.com',
    statusFields: {
      userEmailValidated: true,
      allowThirdPartyProfiling: true,
      hasRepermissioned: true,
    },
    consents,
  },
});

const verifiedUserWithNoConsent = createUser();

module.exports = {
  verifiedUserWithNoConsent,
  createUser,
  USER_ERRORS,
  USER_ENDPOINT,
};
