import {
	TokenResponse,
	UserResponse,
	SessionResponse,
} from '@/server/models/okta/User';
import { Group } from '@/server/models/okta/Group';
import { Consent } from '@/shared/model/Consent';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			createTestUser: typeof createTestUser;
			getTestOktaUser: typeof getTestOktaUser;
			activateTestOktaUser: typeof activateTestOktaUser;
			resetOktaUserPassword: typeof resetOktaUserPassword;
			expireOktaUserPassword: typeof expireOktaUserPassword;
			suspendOktaUser: typeof suspendOktaUser;
			addOktaUserToGroup: typeof addOktaUserToGroup;
			findEmailValidatedOktaGroupId: typeof findEmailValidatedOktaGroupId;
			getOktaUserGroups: typeof getOktaUserGroups;
			getTestUserDetails: typeof getTestUserDetails;
			addToGRS: typeof addToGRS;
			updateTestUser: typeof updateTestUser;
			updateOktaTestUserProfile: typeof updateOktaTestUserProfile;
			getCurrentOktaSession: typeof getCurrentOktaSession;
			closeCurrentOktaSession: typeof closeCurrentOktaSession;
			subscribeToNewsletter: typeof subscribeToNewsletter;
			subscribeToMarketingConsent: typeof subscribeToMarketingConsent;
			sendConsentEmail: typeof sendConsentEmail;
		}
	}
}

type Networks = 'apple' | 'google';

type SocialLink = {
	socialId: number;
	network: Networks;
};

type IDAPITestUserOptions = {
	primaryEmailAddress?: `${string}@${string}.mailosaur.net`;
	isUserEmailValidated?: boolean;
	socialLinks?: SocialLink[];
	password?: string;
	deleteAfterMinute?: boolean;
	isGuestUser?: boolean;
};

/* More fields exist in the user profile, but we only care about the ones we define in the interfaces below. */

interface IDAPIUserProfile {
	id: string;
	privateFields: {
		firstName?: string;
		secondName?: string;
	};
	userGroups: {
		path: string;
		packageCode: string;
		joinedDate: string;
	}[];
	consents: Consent[];
}

interface OktaUserProfile {
	isJobsUser?: boolean;
	firstName?: string;
	lastName?: string;
	legacyIdentityId?: string | null;
}

type IDAPITestUserResponse = [
	{
		key: 'GU_U';
		value: string;
	},
	{
		key: 'SC_GU_LA';
		sessionCookie: boolean;
		value: string;
	},
	{
		key: 'SC_GU_U';
		value: string;
	},
];

export const randomMailosaurEmail = () => {
	return (
		crypto.randomUUID() +
		'@' +
		Cypress.env('MAILOSAUR_SERVER_ID') +
		'.mailosaur.net'
	);
};

export const randomPassword = () => crypto.randomUUID();

export const getTestUserDetails = () =>
	cy.getCookie('SC_GU_U').then((cookie) =>
		cy
			.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/user/me',
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) =>
				cy.wrap({
					status: res.body.status,
					user: res.body.user as IDAPIUserProfile,
				}),
			),
	);

export const updateTestUser = (body: object) =>
	cy.getCookie('SC_GU_U').then((cookie) =>
		cy
			.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/user/me',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				body: JSON.stringify(body) || undefined,
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				cy.wrap({
					status: res.body.status,
				});
			}),
	);

export const addToGRS = () =>
	cy.getCookie('SC_GU_U').then((cookie) =>
		cy
			.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/user/me/group/GRS',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				cy.wrap({
					status: res.body.status,
				});
			}),
	);

export const subscribeToNewsletter = (newsletterListId: string) =>
	cy.getCookie('SC_GU_U').then((cookie) => {
		try {
			return cy.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/users/me/newsletters',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				body: JSON.stringify([
					{
						id: newsletterListId,
						subscribed: true,
					},
				]),
				retryOnStatusCodeFailure: true,
			});
		} catch (error) {
			throw new Error('Failed to subscribe user to newsletter: ' + error);
		}
	});

export const subscribeToMarketingConsent = (marketingId: string) =>
	cy.getCookie('SC_GU_U').then((cookie) => {
		try {
			return cy.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/users/me/consents',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				body: JSON.stringify([
					{
						id: marketingId,
						consented: true,
					},
				]),
			});
		} catch (error) {
			throw new Error(
				'Failed to subscribe user to marketing consent: ' + error,
			);
		}
	});

export const createTestUser = ({
	primaryEmailAddress,
	password,
	socialLinks = [],
	isUserEmailValidated = false,
	deleteAfterMinute = true,
	isGuestUser = false,
}: IDAPITestUserOptions) => {
	// Generate a random email address if none is provided.
	const finalEmail = primaryEmailAddress || randomMailosaurEmail();
	// Generate a random password if none is provided.
	const finalPassword = password || crypto.randomUUID();
	try {
		return cy
			.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/user/test',
				method: 'POST',
				headers: {
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
				},
				body: {
					primaryEmailAddress: finalEmail,
					isUserEmailValidated,
					socialLinks,
					password: finalPassword,
					deleteAfterMinute,
					isGuestUser,
				} as IDAPITestUserOptions,
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				return cy.wrap({
					emailAddress: finalEmail,
					cookies: res.body.values as IDAPITestUserResponse,
					finalPassword,
				});
			});
	} catch (error) {
		throw new Error('Failed to create IDAPI test user: ' + error);
	}
};

export const sendConsentEmail = ({
	emailAddress,
	consents,
	newsletters,
}: {
	emailAddress: string;
	consents?: string[];
	newsletters?: string[];
}) => {
	return cy.getCookie('SC_GU_U').then((cookie) => {
		try {
			return cy.request({
				url: Cypress.env('IDAPI_BASE_URL') + '/consent-email',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
						'IDAPI_CLIENT_ACCESS_TOKEN',
					)}`,
					'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
				},
				body: JSON.stringify([
					{
						email: emailAddress,
						'set-consents': consents,
						'set-lists': newsletters,
					},
				]),
				retryOnStatusCodeFailure: true,
			});
		} catch (error) {
			throw new Error('Failed to send consents email: ' + error);
		}
	});
};

export const getTestOktaUser = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/users/${id}`,
				method: 'GET',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const user = res.body as UserResponse;
				return cy.wrap(user);
			});
	} catch (error) {
		throw new Error('Failed to create Okta test user: ' + error);
	}
};

export const updateOktaTestUserProfile = (
	id: string,
	profile: OktaUserProfile,
) => {
	try {
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/users/${id}`,
				method: 'POST',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				body: {
					profile,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const token = res.body as TokenResponse;
				return cy.wrap(token);
			});
	} catch (error) {
		throw new Error('Failed to update Okta test user: ' + error);
	}
};

export const activateTestOktaUser = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/users/${id}/lifecycle/activate`,
				method: 'POST',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				qs: {
					sendEmail: false,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const token = res.body as TokenResponse;
				return cy.wrap(token);
			});
	} catch (error) {
		throw new Error('Failed to activate Okta test user: ' + error);
	}
};
export const resetOktaUserPassword = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/users/${id}/lifecycle/reset_password`,
				method: 'POST',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				qs: {
					sendEmail: false,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const token = res.body.resetPasswordUrl.split('/').slice(-1)[0];
				return cy.wrap({ token } as TokenResponse);
			});
	} catch (error) {
		throw new Error('Failed to reset password for Okta test user: ' + error);
	}
};
export const expireOktaUserPassword = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/users/${id}/lifecycle/expire_password`,
				method: 'POST',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const user = res.body as UserResponse;
				return cy.wrap(user);
			});
	} catch (error) {
		throw new Error('Failed to expire password for Okta test user: ' + error);
	}
};
export const suspendOktaUser = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/users/${id}/lifecycle/suspend`,
				method: 'POST',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then(() => {
				return cy.wrap(true);
			});
	} catch (error) {
		throw new Error('Failed to suspend Okta test user: ' + error);
	}
};

export const getOktaUserGroups = (id: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/users/${id}/groups`,
				method: 'GET',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const user = res.body as Group[];
				return cy.wrap(user);
			});
	} catch (error) {
		throw new Error('Failed to get user groups: ' + error);
	}
};

export const addOktaUserToGroup = (id: string, groupId: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/groups/${groupId}/users/${id}`,
				method: 'PUT',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then(() => {
				return cy.wrap(true);
			});
	} catch (error) {
		throw new Error('Failed to add Okta test user to group: ' + error);
	}
};

export const findEmailValidatedOktaGroupId = () => {
	try {
		return cy
			.request({
				url: `${Cypress.env(
					'OKTA_ORG_URL',
				)}/api/v1/groups?q=GuardianUser-EmailValidated`,
				method: 'GET',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const group = res.body[0]?.id as string | undefined;
				if (!group) {
					throw new Error('Failed to find Okta group');
				}
				return cy.wrap(group);
			});
	} catch (error) {
		throw new Error(
			'Failed to get ID of GuardianUser-EmailValidated group: ' + error,
		);
	}
};

export const getCurrentOktaSession = ({ idx }: { idx?: string }) => {
	try {
		const Cookie = `${idx ? `idx=${idx};` : ''}`;
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/sessions/me`,
				method: 'GET',
				headers: {
					Cookie,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const session = res.body as SessionResponse;
				return cy.wrap(session);
			});
	} catch (error) {
		throw new Error('Failed to get current Okta session: ' + error);
	}
};

export const closeCurrentOktaSession = ({ idx }: { idx?: string }) => {
	try {
		const Cookie = `${idx ? `idx=${idx};` : ''}`;
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/sessions/me`,
				method: 'DELETE',
				headers: {
					Cookie,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				if (res.status === 204 || res.status == 404) {
					return true;
				}
				return false;
			});
	} catch (error) {
		throw new Error('Failed to close current Okta session: ' + error);
	}
};
