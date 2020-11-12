/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />

const {
  authRedirectSignInRecentlyEmailValidated,
} = require('../support/idapi/auth');
const { allConsents, defaultUserConsent } = require('../support/idapi/consent');
const {
  verifiedUserWithNoConsent,
  createUser,
} = require('../support/idapi/user');
const { setAuthCookies } = require('../support/idapi/cookie');
const Onboarding = require('../support/pages/onboarding/onboarding_page');
const CommunicationsPage = require('../support/pages/onboarding/communications_page.js');
const NewslettersPage = require('../support/pages/onboarding/newsletters_page');
const YourDataPage = require('../support/pages/onboarding/your_data_page');
const ReviewPage = require('../support/pages/onboarding/review_page');

const {
  allNewsletters,
  userNewsletters,
} = require('../support/idapi/newsletter');

describe('Onboarding flow', () => {
  const onboardingFlow = new Onboarding();
  const communicationsPage = new CommunicationsPage();
  const newslettersPage = new NewslettersPage();
  const yourDataPage = new YourDataPage();

  beforeEach(() => {
    cy.idapiMockPurge();
  });

  context('Full flow', () => {
    it('goes through full flow, opt in all consents/newsletters, preserve returnUrl', () => {
      const newslettersToSubscribe = [
        { listId: 4151 },
        { listId: 4147 },
        { listId: 4165 },
        { listId: 4137 },
      ];

      const consent = defaultUserConsent.map(({ id }) => {
        let consented = true;
        if (id.includes('_optout')) {
          consented = false;
        }
        return {
          id,
          consented,
        };
      });

      // set these cookies manually
      // TODO: can cypress set the automatically?
      setAuthCookies();

      // All auth requests to pass
      cy.idapiPermaMock(
        200,
        authRedirectSignInRecentlyEmailValidated,
        '/auth/redirect',
      );

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
      cy.url().should('include', CommunicationsPage.URL);

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      communicationsPage.getCheckboxes().should('not.be.checked');

      // get all opt in checkboxes
      communicationsPage
        .getOptinCheckboxes()
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // does not contain go back link
      cy.get('a')
        .contains(Onboarding.CONTENT.GO_BACK_BUTTON)
        .should('not.exist');

      // mock patch success
      cy.idapiMock(200);

      // mock load newsletters page

      // mock load all newsletters
      cy.idapiMock(200, allNewsletters);

      // mock load user newsletters
      cy.idapiMock(200, userNewsletters());

      // contains save and continue button
      cy.get('button')
        .contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON)
        // click to go to next page
        .click();

      cy.idapiLastPayloadIs([
        { id: 'market_research_optout', consented: false },
        { id: 'supporter', consented: true },
        { id: 'jobs', consented: true },
        { id: 'holidays', consented: true },
        { id: 'events', consented: true },
        { id: 'offers', consented: true },
      ]);

      // click, multiple is true as we target multiple elements
      // check if we're on the consents flow, newsletters page
      cy.url().should('include', NewslettersPage.URL);

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // contain go back link
      cy.get('a')
        .contains(Onboarding.CONTENT.GO_BACK_BUTTON)
        .should('exist')
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      newslettersPage
        .getCheckboxes()
        .should('not.be.checked')
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // mock load all newsletters
      cy.idapiMock(200, allNewsletters);

      // mock load user newsletters
      cy.idapiMock(200, userNewsletters());

      // mock patch success
      cy.idapiMock(200);

      // mock load your data page
      // all consents mock response for your data page of consents flow
      cy.idapiMock(200, allConsents);

      // user consents mock response for your data page of consents flow
      cy.idapiMock(200, verifiedUserWithNoConsent);

      // contains save and continue button
      cy.get('button')
        .contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON)
        // click to go to next page
        .click();

      cy.idapiLastPayloadIs([
        { id: '4151', subscribed: true },
        { id: '4165', subscribed: true },
        { id: '4147', subscribed: true },
        { id: '4137', subscribed: true },
      ]);

      // check if we're on the consents flow, your data page
      cy.url().should('include', YourDataPage.URL);

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // contain go back link
      cy.get('a')
        .contains(Onboarding.CONTENT.GO_BACK_BUTTON)
        .should('exist')
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      yourDataPage.getCheckboxes().should('not.be.checked');

      // mock patch success
      cy.idapiMock(200);

      // mock load review page
      // all consents mock response for review  of consents flow
      cy.idapiMock(200, allConsents);

      // user consents mock response for review of consents flow
      cy.idapiMock(200, createUser(consent));

      // mock load all newsletters
      cy.idapiMock(200, allNewsletters);

      // mock load user newsletters
      cy.idapiMock(200, userNewsletters(newslettersToSubscribe));

      // contains save and continue button
      cy.get('button')
        .contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON)
        // click to go to next page
        .click();

      // check if we're on the consents flow, review page
      cy.url().should('include', ReviewPage.URL);

      // check return url exists
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // does not contain go back link
      cy.get('a')
        .contains(Onboarding.CONTENT.GO_BACK_BUTTON)
        .should('not.exist');

      // does not contain save and continue button
      cy.contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON).should('not.exist');

      // contains opted in consents
      Object.values(ReviewPage.CONTENT.CONSENT).forEach((consent) =>
        cy.contains(consent),
      );

      // contains opted in newsletters
      Object.values(ReviewPage.CONTENT.NEWSLETTERS).forEach((newsletter) =>
        cy.contains(newsletter),
      );

      // marketing research opted in
      cy.contains(ReviewPage.CONTENT.CONSENT_OPTOUT.RESEARCH)
        .parent()
        .siblings()
        .children()
        .contains('Yes');

      // marketing analysis opted in
      cy.contains(ReviewPage.CONTENT.CONSENT_OPTOUT.ANALYSIS)
        .parent()
        .siblings()
        .children()
        .contains('Yes');

      // return to guardian button
      cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN)
        .should('exist')
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
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
