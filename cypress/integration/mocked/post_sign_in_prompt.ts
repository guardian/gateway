import {
  authRedirectSignInRecentlyEmailValidated,
  AUTH_REDIRECT_ENDPOINT,
} from '../../support/idapi/auth';
import { allConsents, CONSENTS_ENDPOINT } from '../../support/idapi/consent';
import {
  verifiedUserWithNoConsent,
  createUser,
  USER_ENDPOINT,
} from '../../support/idapi/user';
import { setAuthCookies } from '../../support/idapi/cookie';
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Post sign-in prompt', () => {
  const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
  const returnUrl = 'https://www.theguardian.com/about';

  beforeEach(() => {
    cy.mockPurge();
    setAuthCookies();
    cy.mockAll(
      200,
      authRedirectSignInRecentlyEmailValidated,
      AUTH_REDIRECT_ENDPOINT,
    );
    cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
    cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
    cy.intercept('GET', defaultReturnUrl, (req) => {
      req.reply(200);
    });
    cy.intercept('GET', returnUrl, (req) => {
      req.reply(200);
    });
  });

  it('Has no detectable a11y violations on prompt page', () => {
    cy.visit('/signin/success');
    injectAndCheckAxe();
  });

  it('Allows user to opt in and continue', () => {
    cy.visit('/signin/success');
    const checkbox = cy.findByLabelText('Yes, sign me up');
    checkbox.should('not.be.checked');
    checkbox.click();

    // mock form save success
    cy.mockNext(200);

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: true }]);
    cy.url().should('include', defaultReturnUrl);
  });

  it('Allows user to opt out and continue', () => {
    const supporterConsent = allConsents.find(({ id }) => id === 'supporter');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const consentData = [{ ...supporterConsent!, consented: true }];
    cy.mockAll(200, createUser(consentData), USER_ENDPOINT);
    cy.visit('/signin/success');
    const checkbox = cy.findByLabelText('Yes, sign me up');
    checkbox.should('be.checked');
    checkbox.click();

    // mock form save success
    cy.mockNext(200);

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: false }]);
    cy.url().should('include', defaultReturnUrl);
  });

  it('Allows user to continue to different returnUrl', () => {
    cy.visit(`/signin/success?returnUrl=${encodeURIComponent(returnUrl)}`);

    // mock form save success
    cy.mockNext(200);

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: false }]);
    cy.url().should('include', returnUrl);
  });
});
