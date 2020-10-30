const { defaultUserConsent } = require('./consent');

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
};
