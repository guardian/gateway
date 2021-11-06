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
};

export const randomMailosaurEmail = () => {
  return uuidv4() + '@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net';
};

export const createTestUser = ({
  primaryEmailAddress,
  socialLinks,
  isUserEmailValidated,
  password,
}: IDAPITestUserOptions) => {
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
        } as IDAPITestUserOptions,
      })
      .then((res) => {
        return cy.wrap({
          emailAddress: finalEmail,
          cookies: res.body.values,
        });
      });
  } catch (error) {
    console.error(error);
  }
};
