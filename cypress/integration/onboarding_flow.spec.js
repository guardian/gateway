/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />

const {
  authRedirectSignInRecentlyEmailValidated,
} = require('../support/idapi/auth');
const { allConsents } = require('../support/idapi/consent');
const { verifiedUserWithNoConsent } = require('../support/idapi/user');
const { setAuthCookies } = require('../support/idapi/cookie');
const Onboarding = require('../support/pages/onboarding_pages');
const {
  allNewsletters,
  userNewsletters,
} = require('../support/idapi/newsletter');

describe('Onboarding flow', () => {
  const onboardingFlow = new Onboarding();

  beforeEach(() => {
    cy.idapiMockPurge();
  });

  const getCheckboxes = () => cy.get('[type="checkbox"]');

  const getOptoutCheckboxes = () => getCheckboxes().get('[name*="_optout"]');

  const getOptinCheckboxes = () => getCheckboxes().not('[name*="_optout"]');

  context('Full flow', () => {
    it('goes through full flow, opt in all consents/newsletters, preserve returnUrl', () => {
      // set these cookies manually
      // TODO: can cypress set the automatically?
      setAuthCookies();

      // set successful auth using login middleware (/consents)
      cy.idapiMock(200, authRedirectSignInRecentlyEmailValidated);

      // set successful auth using login middleware (/consents/communication)
      cy.idapiMock(200, authRedirectSignInRecentlyEmailValidated);

      // all newsletters mock response for first page of consents flow
      cy.idapiMock(200, allConsents);

      // user newsletters mock response for first page of consents flow
      cy.idapiMock(200, verifiedUserWithNoConsent);

      // setup returnurl
      const returnUrl = encodeURIComponent(
        `https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
      );

      // go to onboarding flow
      onboardingFlow.goto({
        query: {
          returnUrl,
        },
      });

      // check if we're on the consents flow, communication page
      cy.url().should(
        'include',
        `${Onboarding.URL}${Onboarding.CONTENT.COMMUNICATION_PAGE}`,
      );

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // get all checkboxes
      getCheckboxes()
        // check not checked
        .should('not.be.checked');

      // get all opt in checkboxes
      getOptinCheckboxes()
        // select parent (to avoid cypress element not visible error)
        .parent()
        // click, multiple is true as we target multiple elements
        .click({ multiple: true });

      // check opt ins are checked
      getOptinCheckboxes().should('be.checked');

      // check opt outs are not checked
      getOptoutCheckboxes().should('not.be.checked');

      // mock auth for post
      // set successful auth using login middleware (/consents)
      cy.idapiMock(200, authRedirectSignInRecentlyEmailValidated);

      // mock patch success
      cy.idapiMock(200);

      // mock load newsletters page
      cy.idapiMock(200, authRedirectSignInRecentlyEmailValidated);

      // mock load all newsletters
      cy.idapiMock(200, allNewsletters);

      // mock load user newsletters
      cy.idapiMock(200, userNewsletters());

      // does not contain go back link
      cy.get('a')
        .contains(Onboarding.CONTENT.GO_BACK_BUTTON)
        .should('not.exist');

      // contains save and continue button
      cy.get('button')
        .contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON)
        // click to go to next page
        .click();

      // check if we're on the consents flow, newsletters page
      cy.url().should(
        'include',
        `${Onboarding.URL}${Onboarding.CONTENT.NEWSLETTER_PAGE}`,
      );

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // contain go back link
      cy.get('a').contains(Onboarding.CONTENT.GO_BACK_BUTTON).should('exist');

      // get all checkboxes
      getCheckboxes()
        // check not checked
        .should('not.be.checked')
        // select parent (to avoid cypress element not visible error)
        .parent()
        // click, multiple is true as we target multiple elements
        .click({ multiple: true })
        // check if checked ;)
        .should('be.checked');
    });
    // it(
    //   'goes through full flow, opt out all consents/newsletters, preserve returnUrl',
    // );
    // it(
    //   'goes through full flow, opt in some consents/newsletters, default returnUrl',
    // );
  });

  context('Login middleware', () => {
    // it('no sc_gu_u cookie, redirect to login page');
    // it('no sc_gu_la cookie, redirect to login page');
    // it('email not validated, go to verify email page');
    // it('recently validated, go to consents flow');
    // it('not recently validated, go to login page');
    // it('generic idapi error');
  });

  context('Newsletters page', () => {
    // it('correct newsletters shown for uk, none checked by default');
    // it('correct newsletters shown for us, none checked by default');
    // it('correct newsletters shown for aus, none checked by default');
    // it('correct newsletters shown for row/default, none checked by default');
    // it(
    //  'navigate back to newsletters page after saving will preserve newsletters'
    // );
    // it(
    //  'navigate back to newsletters page after will let you change and save selections'
    // );
    // it('generic idapi error');
  });

  context('Contact options page', () => {
    // it('shows correct contact options, none checked by default');
    // it(
    //  'navigate back to contact options page after saving will preserve consents'
    // );
    // it(
    //  'navigate back to contact options page after saving will let you change and save selections'
    // );
    // it('generic idapi error');
  });

  context('Your data page', () => {
    // it('correct consent shown');
    // it('generic idapi error');
  });

  context('Review page', () => {
    // it('correct options shown based on user consent/newsletter selections');
    // it('default return url link');
    // it('query parameter based return url link');
    // it('generic idapi error');
  });
});
