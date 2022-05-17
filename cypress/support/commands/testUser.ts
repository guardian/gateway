import { v4 as uuidv4 } from 'uuid';
import { TokenResponse, UserResponse } from '@/server/models/okta/User';
import { Group } from '@/server/models/okta/Group';

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
    }
  }
}

type Networks = 'facebook' | 'apple' | 'google';

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

interface User {
  privateFields: {
    firstName?: string;
    secondName?: string;
  };
  userGroups: {
    path: string;
    packageCode: string;
    joinedDate: string;
  }[];
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
  return uuidv4() + '@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net';
};

export const randomPassword = () => uuidv4();

export const getTestUserDetails = () =>
  cy.getCookie('SC_GU_U').then((cookie) =>
    cy
      .request({
        url: Cypress.env('IDAPI_BASE_URL') + '/user/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://profile.thegulocal.com',
          'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
            'IDAPI_CLIENT_ACCESS_TOKEN',
          )}`,
          'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
        },
      })
      .then((res) =>
        cy.wrap({
          status: res.body.status,
          user: res.body.user as User,
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
          Origin: 'https://profile.thegulocal.com',
          'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
            'IDAPI_CLIENT_ACCESS_TOKEN',
          )}`,
          'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
        },
        body: JSON.stringify(body) || undefined,
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
          Origin: 'https://profile.thegulocal.com',
          'X-GU-ID-Client-Access-Token': `Bearer ${Cypress.env(
            'IDAPI_CLIENT_ACCESS_TOKEN',
          )}`,
          'X-GU-ID-FOWARDED-SC-GU-U': cookie?.value,
        },
      })
      .then((res) => {
        cy.wrap({
          status: res.body.status,
        });
      }),
  );

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
  const finalPassword = password || uuidv4();
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
