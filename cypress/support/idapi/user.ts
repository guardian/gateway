import { defaultUserConsent } from './consent';

export const USER_ENDPOINT = '/user/me';

export const USER_CONSENTS_ENDPOINT = '/users/me/consents';

export const createUser = (consents = defaultUserConsent) => ({
	status: 'ok',
	user: {
		primaryEmailAddress: 'a.reader@example.com',
		statusFields: {
			userEmailValidated: true,
		},
		consents,
	},
});

export const verifiedUserWithNoConsent = createUser();
