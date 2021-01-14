import { defaultUserConsent } from './consent';

export const USER_ENDPOINT = '/user/me';

export const USER_ERRORS = {
  GENERIC: 'There was a problem retrieving your details, please try again.',
};

export const createUser = (consents = defaultUserConsent) => ({
  status: 'ok',
  user: {
    primaryEmailAddress: 'a.reader@example.com',
    statusFields: {
      userEmailValidated: true,
      hasRepermissioned: true,
    },
    consents,
  },
});

export const verifiedUserWithNoConsent = createUser();
