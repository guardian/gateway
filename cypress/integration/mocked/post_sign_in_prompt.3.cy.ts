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

// TODO: remove this once we have migrated fully to OAuth as we're unable to mock the OAuth flow to get Tokens
// TODO: best thing to do will move as much as possible to the ete tests
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
    cy.intercept('GET', defaultReturnUrl, (req) => {
      req.reply(200);
    });
    cy.intercept('GET', returnUrl, (req) => {
      req.reply(200);
    });
  });

  it('has no detectable a11y violations on prompt page', () => {
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.visit('/signin/success?useIdapi=true');
    injectAndCheckAxe();
  });

  it('allows user to opt in and continue', () => {
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.visit('/signin/success?useIdapi=true');
    const checkbox = cy.findByLabelText('Yes, sign me up');
    checkbox.should('not.be.checked');
    checkbox.click();

    // mock form save success
    cy.mockNext(200, {});

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: true }]);
    cy.url().should('include', defaultReturnUrl);
  });

  it('allows user to opt out and continue', () => {
    const supporterConsent = allConsents.find(({ id }) => id === 'supporter');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const consentData = [{ ...supporterConsent!, consented: true }];
    cy.mockAll(200, createUser(consentData), USER_ENDPOINT);
    cy.mockNext(200, consentData);
    cy.visit('/signin/success?useIdapi=true');
    const checkbox = cy.findByLabelText('Yes, sign me up');
    checkbox.should('be.checked');
    checkbox.click();

    // mock form save success
    cy.mockNext(200, {});

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: false }]);
    cy.url().should('include', defaultReturnUrl);
  });

  it('allows user to continue to different returnUrl', () => {
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.visit(
      `/signin/success?returnUrl=${encodeURIComponent(
        returnUrl,
      )}&useIdapi=true`,
    );

    // mock form save success
    cy.mockNext(200, {});

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: false }]);
    cy.url().should('include', returnUrl);
  });

  it('fails silently if submit fails, but user did not consent', () => {
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.mockNext(500, {});
    cy.visit('/signin/success?useIdapi=true');

    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: false }]);
    cy.url().should('include', defaultReturnUrl);
  });

  it('shows error if submit fails and user did consent', () => {
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.visit('/signin/success?useIdapi=true');
    cy.findByLabelText('Yes, sign me up').click();

    cy.mockNext(500, undefined);
    cy.mockNext(200, verifiedUserWithNoConsent.user.consents);
    cy.findByText('Continue to the Guardian').click();
    cy.lastPayloadIs([{ id: 'supporter', consented: true }]);
    cy.url().should('include', '/signin/success');
    cy.findByText(
      'There was a problem saving your choice, please try again.',
    ).should('exist');
  });

  it('redirects to returnUrl if fetching consents fails', () => {
    cy.mockNext(500, {});
    /**
     * Using cy.request instead of cy.visit as we only need to test the redirect
     * and cy.intercept does not seem to work here
     */
    cy.request({
      url: '/signin/success?useIdapi=true',
      followRedirect: false,
    }).then((response) =>
      expect(response.redirectedToUrl).to.contain(defaultReturnUrl),
    );
  });

  it('redirects to returnUrl if fetching user consents fails', () => {
    cy.mockNext(500, undefined);
    // Using cy.request instead of cy.visit, see above for reasoning.
    cy.request({
      url: '/signin/success?useIdapi=true',
      followRedirect: false,
    }).then((response) =>
      expect(response.redirectedToUrl).to.contain(defaultReturnUrl),
    );
  });
});
