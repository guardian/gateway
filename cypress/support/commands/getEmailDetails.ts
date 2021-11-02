import { Message } from 'cypress-mailosaur';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getEmailDetails: typeof getEmailDetails;
    }
  }
}

export const getEmailDetails = (email: Message, tokenMatcher?: RegExp) => {
  const { id, html } = email;
  const { body, links } = html || {};
  if (id === undefined || body === undefined || links === undefined) {
    throw new Error('Email details not found');
  }
  let token = null;
  if (tokenMatcher) {
    const match = body.match(tokenMatcher);
    if (match === null) {
      throw new Error('Unable to find token');
    }
    token = match[1];
  }

  return cy.wrap({ id, body, token, links });
};
