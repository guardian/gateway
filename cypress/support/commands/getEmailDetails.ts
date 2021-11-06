import { Message } from 'cypress-mailosaur';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getEmailDetails: typeof getEmailDetails;
      checkForEmailAndGetDetails: typeof checkForEmailAndGetDetails;
    }
  }
}

export const checkForEmailAndGetDetails = (
  sentTo: string,
  receivedAfter?: Date,
  tokenMatcher?: RegExp,
  deleteAfter = true,
) => {
  return cy
    .mailosaurGetMessage(
      Cypress.env('MAILOSAUR_SERVER_ID'),
      { sentTo },
      {
        receivedAfter,
      },
    )
    .then((message: Message) => {
      return getEmailDetails(message, tokenMatcher).then((details) => {
        if (deleteAfter) {
          cy.mailosaurDeleteMessage(details.id);
        }
        return cy.wrap(details);
      });
    });
};

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
