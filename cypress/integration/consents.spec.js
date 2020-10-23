/// <reference types="cypress" />
const {
  authRedirectSignInRecentlyEmailValidated,
} = require('../support/idapi/auth');
const { authCookieResponse } = require('../support/idapi/cookie');
const {
  allNewsletters,
  userNewsletters,
} = require('../support/idapi/newsletter');
const {
  validationTokenExpired,
  validationTokenInvalid,
} = require('../support/idapi/verify_email');
const VerifyEmail = require('../support/pages/verify_email');

describe('Consents flow', () => {
  const verifyEmailFlow = new VerifyEmail();

  beforeEach(() => {
    cy.idapiMockPurge();
  });

  context('Verify email', () => {
    it('successfuly verifies the email using a token and sets auth cookies', () => {
      // mock validation success response (200 with auth cookies)
      cy.idapiMock(200, authCookieResponse);

      // set these cookies manually
      // TODO: can cypress set the automatically?
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');
      cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');

      // set successful auth using login middleware
      cy.idapiMock(200, authRedirectSignInRecentlyEmailValidated);

      // all newsletters mock response
      cy.idapiMock(200, allNewsletters);

      // user newsletters mock response
      cy.idapiMock(200, userNewsletters());

      // go to verify email endpoint
      verifyEmailFlow.goto('avalidtoken');

      // check if verified email text exists
      cy.contains(VerifyEmail.CONTENT.EMAIL_VERIFIED);
    });

    it('verification token is expired, logged out, shows page to sign in to resend validation email', () => {
      // mock token expired
      cy.idapiMock(403, validationTokenExpired);

      // go to verify email endpont
      verifyEmailFlow.goto('expiredtoken', { failOnStatusCode: false });

      cy.contains(VerifyEmail.CONTENT.LINK_EXPIRED);
      cy.contains(VerifyEmail.CONTENT.TOKEN_EXPIRED);
    });

    it('verification token is invalid, logged out, shows page to sign in to resend validation email', () => {
      // mock token expired
      cy.idapiMock(403, validationTokenInvalid);

      // go to verify email endpont
      verifyEmailFlow.goto('aninvalidtoken', { failOnStatusCode: false });

      cy.contains(VerifyEmail.CONTENT.LINK_EXPIRED);
      cy.contains(VerifyEmail.CONTENT.TOKEN_EXPIRED);
    });
  });
});
