import { v4 as uuidv4 } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createTestUser: typeof createTestUser;
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
          password,
          deleteAfterMinute,
          isGuestUser,
        } as IDAPITestUserOptions,
      })
      .then((res) => {
        console.log(res.body.values);
        return cy.wrap({
          emailAddress: finalEmail,
          cookies: res.body.values as IDAPITestUserResponse,
        });
      });
  } catch (error) {
    throw new Error('Failed to create IDAPI test user: ' + error);
  }
};
