/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { getEnvironmentVariable } from '../support/util';

import {
  authRedirectSignInRecentlyEmailValidated,
  AUTH_REDIRECT_ENDPOINT,
} from '../support/idapi/auth';
import {
  allConsents,
  defaultUserConsent,
  optedOutUserConsent,
  getUserConsents,
  CONSENTS_ENDPOINT,
  CONSENT_ERRORS,
} from '../support/idapi/consent';
import {
  verifiedUserWithNoConsent,
  createUser,
  USER_ERRORS,
  USER_ENDPOINT,
} from '../support/idapi/user';
import { setAuthCookies } from '../support/idapi/cookie';
import CommunicationsPage from '../support/pages/onboarding/communications_page.js';
import NewslettersPage from '../support/pages/onboarding/newsletters_page';
import YourDataPage from '../support/pages/onboarding/your_data_page';
import ReviewPage from '../support/pages/onboarding/review_page';
import { injectAndCheckAxe } from '../support/cypress-axe';

const {
  allNewsletters,
  userNewsletters,
  NEWSLETTER_ENDPOINT,
  NEWSLETTER_SUBSCRIPTION_ENDPOINT,
  NEWSLETTER_ERRORS,
} = require('../support/idapi/newsletter');
const Onboarding = require('../support/pages/onboarding/onboarding_page');
const VerifyEmail = require('../support/pages/verify_email');
const {
  getGeoLocationHeaders,
  GEOLOCATION_CODES,
} = require('../support/geolocation');

const { NEWSLETTERS } = NewslettersPage.CONTENT;

describe('Onboarding flow', () => {
  beforeEach(() => {
    cy.idapiMockPurge();
  });

  context('Full flow', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      cy.idapiMockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

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

      const returnUrl = encodeURIComponent(
        `https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
      );

      CommunicationsPage.gotoFlowStart({
        query: {
          returnUrl,
        },
      });

      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.allCheckboxes().should('not.be.checked');
      CommunicationsPage.marketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.saveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: 'market_research_optout', consented: true },
        { id: 'supporter', consented: false },
      ]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.backButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      NewslettersPage.allCheckboxes()
        .should('not.be.checked')
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.saveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: '4151', subscribed: true },
        { id: '4165', subscribed: true },
        { id: '4147', subscribed: true },
        { id: '4137', subscribed: true },
      ]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.backButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.allCheckboxes().should('not.be.checked');

      // mock form save success
      cy.idapiMockNext(200);

      // user consents mock response for review of consents flow
      cy.idapiMockAll(200, createUser(consent), USER_ENDPOINT);

      // mock load user newsletters
      cy.idapiMockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );

      YourDataPage.saveAndContinueButton().click();

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.backButton().should('not.exist');
      ReviewPage.saveAndContinueButton().should('not.exist');

      // contains opted in consents
      Object.values(ReviewPage.CONTENT.CONSENT).forEach((consent) =>
        cy.contains(consent),
      );

      // contains opted in newsletters
      Object.values(ReviewPage.CONTENT.NEWSLETTERS).forEach((newsletter) =>
        cy.contains(newsletter),
      );

      ReviewPage.marketingResearchChoice().contains('Yes');
      ReviewPage.marketingAnalysisChoice().contains('Yes');

      ReviewPage.returnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });

    it('goes through full flow, opt out all consents/newsletters, preserve returnUrl', () => {
      const returnUrl = encodeURIComponent(
        `https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
      );

      CommunicationsPage.gotoFlowStart({
        query: {
          returnUrl,
        },
      });

      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      CommunicationsPage.backButton().should('not.exist');

      CommunicationsPage.allCheckboxes().should('not.be.checked');
      CommunicationsPage.allOptoutCheckboxes()
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.saveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: 'market_research_optout', consented: false },
        { id: 'supporter', consented: true },
      ]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.backButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.saveAndContinueButton().click();
      cy.idapiLastPayloadIs([]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.backButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.marketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      cy.idapiMockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);

      YourDataPage.saveAndContinueButton().click();
      cy.idapiLastPayloadIs([{ id: 'profiling_optout', consented: true }]);

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.backButton().should('not.exist');
      ReviewPage.saveAndContinueButton().should('not.exist');

      ReviewPage.newslettersSection().contains('N/A');
      ReviewPage.consentsSection().contains('N/A');

      ReviewPage.marketingResearchChoice().contains('No');
      ReviewPage.marketingAnalysisChoice().contains('No');

      ReviewPage.returnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });

    it('uses a default returnUrl if none provided', () => {
      const returnUrl = encodeURIComponent(
        getEnvironmentVariable('DEFAULT_RETURN_URI'),
      );

      CommunicationsPage.gotoFlowStart();

      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.saveAndContinueButton().click();

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.saveAndContinueButton().click();

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.marketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      YourDataPage.saveAndContinueButton().click();
      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.returnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });
  });

  context('Login middleware', () => {
    it('no sc_gu_u cookie, redirect to login page', () => {
      const signInUrl = getEnvironmentVariable('SIGN_IN_PAGE_URL');
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(signInUrl);
      });
    });

    it('no sc_gu_la cookie, redirect to login page', () => {
      const signInUrl = getEnvironmentVariable('SIGN_IN_PAGE_URL');
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(signInUrl);
      });
    });

    it('email not validated, go to verify email page', () => {
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInRecently',
        emailValidated: false,
        redirect: null,
      };
      cy.idapiMockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(VerifyEmail.URL);
      });
    });

    it('recently logged in, go to consents flow', () => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(CommunicationsPage.URL);
      });
    });

    it('not recently logged in, follows supplied redirect', () => {
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInNotRecently',
        emailValidated: true,
        redirect: {
          url: 'https://fakeloginfortest.code.dev-theguardian.co.uk',
        },
      };
      cy.idapiMockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          'https://fakeloginfortest.code.dev-theguardian.co.uk',
        );
      });
    });

    it('if missing redirect information, it redirects to the default ', () => {
      const signInUrl = getEnvironmentVariable('SIGN_IN_PAGE_URL');
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInNotRecently',
        emailValidated: true,
        redirect: undefined,
      };

      cy.idapiMockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(signInUrl);
      });
    });

    it('on idapi error it redirects to the sign in page with the error flag set', () => {
      const signInUrl = getEnvironmentVariable('SIGN_IN_PAGE_URL');
      setAuthCookies();
      cy.idapiMockAll(502, 'gateway error', AUTH_REDIRECT_ENDPOINT);
      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          `${signInUrl}?error=signin-error-bad-request`,
        );
      });
    });
  });

  context('Contact options page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected consents', () => {
      const consented = getUserConsents(['jobs', 'offers']);
      cy.idapiMockAll(200, createUser(consented), USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('shows correct contact options, none checked by default', () => {
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.allCheckboxes().should('not.be.checked');
    });

    it('shows any previously selected consents', () => {
      const consented = getUserConsents(['supporter']);
      cy.idapiMockAll(200, createUser(consented), USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.consentCheckboxWithTitle(
        'Subscriptions, membership and contributions',
      ).should('be.checked');
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.errorBanner().contains(USER_ERRORS.GENERIC);
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Newsletters page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.idapiMockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

      cy.visit(NewslettersPage.URL, { headers });
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected newsletter', () => {
      const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
      cy.idapiMockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );
      NewslettersPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_ENDPOINT);
      NewslettersPage.goto();
      injectAndCheckAxe();
    });

    it('correct newsletters shown for uk, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.BOOKMARKS).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for United States of America, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AMERICA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.TODAY_US).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.BOOKMARKS).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for Australia, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AUSTRALIA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.TODAY_AUS).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.BOOKMARKS).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for rest of the world, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.OTHERS);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.BOOKMARKS).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('show already selected newsletters', () => {
      const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
      cy.idapiMockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );
      NewslettersPage.goto();

      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.BOOKMARKS).should(
        'not.be.checked',
      );
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.backButton().should('not.exist');
      NewslettersPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.backButton().should('not.exist');
      NewslettersPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Your data page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected consent', () => {
      cy.idapiMockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('displays the marketing opt out, unchecked by default', () => {
      YourDataPage.goto();
      YourDataPage.marketingOptoutCheckbox().should('not.be.checked');
    });

    it('displays the marketing opt out, checked if the user has previously opted out', () => {
      cy.idapiMockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.marketingOptoutCheckbox().should('be.checked');
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.errorBanner().contains(USER_ERRORS.GENERIC);
      YourDataPage.backButton().should('not.exist');
      YourDataPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
      YourDataPage.backButton().should('not.exist');
      YourDataPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Review page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.idapiMockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      ReviewPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      ReviewPage.goto();
      injectAndCheckAxe();
    });

    it('displays a relevant error if on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(USER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });
  });

  context('Not found', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
    });

    it('shows 404 page if onboarding page is not found', () => {
      cy.visit('/consents/unknown', { failOnStatusCode: false });
      cy.contains('the page does not exist');
    });
  });

  context('AB Test - Single Newsletter test', () => {
    context('Contact Options Page', () => {
      beforeEach(() => {
        setAuthCookies();
        cy.idapiMockAll(
          200,
          authRedirectSignInRecentlyEmailValidated,
          AUTH_REDIRECT_ENDPOINT,
        );
        cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      });

      it('does not show market research checkbox in variant', () => {
        cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
        cy.setMvtId('1');
        CommunicationsPage.goto();
        injectAndCheckAxe();
        cy.get('[name="market_research_optout"]').should('not.exist');
      });

      it('shows market research checkbox in control', () => {
        cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
        cy.setMvtId('2');
        CommunicationsPage.goto();
        injectAndCheckAxe();
        cy.get('[name="market_research_optout"]')
          .should('exist')
          .should('not.be.checked');
      });
    });

    context('Newsletter Page', () => {
      beforeEach(() => {
        setAuthCookies();
        cy.idapiMockAll(
          200,
          authRedirectSignInRecentlyEmailValidated,
          AUTH_REDIRECT_ENDPOINT,
        );
        cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
        cy.idapiMockAll(
          200,
          userNewsletters(),
          NEWSLETTER_SUBSCRIPTION_ENDPOINT,
        );
      });

      it('shows single newsletter in variant', () => {
        const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

        cy.setMvtId('1');

        cy.visit(NewslettersPage.URL, { headers });

        injectAndCheckAxe();

        NewslettersPage.newsletterCheckboxWithTitle(
          NEWSLETTERS.TODAY_UK,
        ).should('not.be.checked');
        cy.contains(NEWSLETTERS.LONG_READ).should('not.exist');
        cy.contains(NEWSLETTERS.GREEN_LIGHT).should('not.exist');
        cy.contains(NEWSLETTERS.BOOKMARKS).should('not.exist');

        CommunicationsPage.backButton().should('exist');
        CommunicationsPage.saveAndContinueButton().should('exist');
      });

      it('shows four newsletters in control', () => {
        const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

        cy.setMvtId('2');

        cy.visit(NewslettersPage.URL, { headers });

        injectAndCheckAxe();

        NewslettersPage.newsletterCheckboxWithTitle(
          NEWSLETTERS.TODAY_UK,
        ).should('not.be.checked');
        NewslettersPage.newsletterCheckboxWithTitle(
          NEWSLETTERS.LONG_READ,
        ).should('not.be.checked');
        NewslettersPage.newsletterCheckboxWithTitle(
          NEWSLETTERS.GREEN_LIGHT,
        ).should('not.be.checked');
        NewslettersPage.newsletterCheckboxWithTitle(
          NEWSLETTERS.BOOKMARKS,
        ).should('not.be.checked');

        CommunicationsPage.backButton().should('exist');
        CommunicationsPage.saveAndContinueButton().should('exist');
      });
    });

    context('Review Page', () => {
      beforeEach(() => {
        setAuthCookies();
        cy.idapiMockAll(
          200,
          authRedirectSignInRecentlyEmailValidated,
          AUTH_REDIRECT_ENDPOINT,
        );
        cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
        cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
        cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
        cy.idapiMockAll(
          200,
          userNewsletters(),
          NEWSLETTER_SUBSCRIPTION_ENDPOINT,
        );
      });

      it('hides market research from review page in variant', () => {
        cy.setMvtId('1');
        ReviewPage.goto();
        injectAndCheckAxe();
        cy.contains(ReviewPage.CONTENT.CONSENT_OPTOUT.RESEARCH).should(
          'not.exist',
        );
      });

      it('shows market research from review page in control', () => {
        cy.setMvtId('2');
        ReviewPage.goto();
        injectAndCheckAxe();
        cy.contains(ReviewPage.CONTENT.CONSENT_OPTOUT.RESEARCH).should('exist');
      });
    });
  });
});
