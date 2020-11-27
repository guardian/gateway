/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />

const {
  authRedirectSignInRecentlyEmailValidated,
} = require('../support/idapi/auth');
const {
  allConsents,
  defaultUserConsent,
  optedOutUserConsent,
  getUserConsents,
  CONSENTS_ENDPOINT,
  CONSENT_ERRORS,
} = require('../support/idapi/consent');
const {
  verifiedUserWithNoConsent,
  createUser,
  USER_ERRORS,
  USER_ENDPOINT,
} = require('../support/idapi/user');
const { setAuthCookies } = require('../support/idapi/cookie');
const CommunicationsPage = require('../support/pages/onboarding/communications_page.js');
const NewslettersPage = require('../support/pages/onboarding/newsletters_page');
const YourDataPage = require('../support/pages/onboarding/your_data_page');
const ReviewPage = require('../support/pages/onboarding/review_page');

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
        '/auth/redirect',
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

      CommunicationsPage.getBackButton().should('not.exist');
      CommunicationsPage.getCheckboxes().should('not.be.checked');
      CommunicationsPage.getMarketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.getSaveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: 'market_research_optout', consented: true },
        { id: 'supporter', consented: false },
        { id: 'jobs', consented: false },
        { id: 'holidays', consented: false },
        { id: 'events', consented: false },
        { id: 'offers', consented: false },
      ]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.getBackButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      NewslettersPage.getCheckboxes()
        .should('not.be.checked')
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.getSaveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: '4151', subscribed: true },
        { id: '4165', subscribed: true },
        { id: '4147', subscribed: true },
        { id: '4137', subscribed: true },
      ]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.getBackButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.getCheckboxes().should('not.be.checked');

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

      YourDataPage.getSaveAndContinueButton().click();

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.getBackButton().should('not.exist');
      ReviewPage.getSaveAndContinueButton().should('not.exist');

      // contains opted in consents
      Object.values(ReviewPage.CONTENT.CONSENT).forEach((consent) =>
        cy.contains(consent),
      );

      // contains opted in newsletters
      Object.values(ReviewPage.CONTENT.NEWSLETTERS).forEach((newsletter) =>
        cy.contains(newsletter),
      );

      ReviewPage.getMarketingResearchChoice().contains('Yes');
      ReviewPage.getMarketingAnalysisChoice().contains('Yes');

      ReviewPage.getReturnButton()
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

      CommunicationsPage.getBackButton().should('not.exist');

      CommunicationsPage.getCheckboxes().should('not.be.checked');
      CommunicationsPage.getOptoutCheckboxes()
        // select parent (to avoid cypress element not visible error)
        .parent()
        .click({ multiple: true });

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.getSaveAndContinueButton().click();

      cy.idapiLastPayloadIs([
        { id: 'market_research_optout', consented: false },
        { id: 'supporter', consented: true },
        { id: 'jobs', consented: true },
        { id: 'holidays', consented: true },
        { id: 'events', consented: true },
        { id: 'offers', consented: true },
      ]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.getBackButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.getSaveAndContinueButton().click();
      cy.idapiLastPayloadIs([]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.getBackButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.getMarketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      cy.idapiMockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);

      YourDataPage.getSaveAndContinueButton().click();
      cy.idapiLastPayloadIs([{ id: 'profiling_optout', consented: true }]);

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.getBackButton().should('not.exist');
      ReviewPage.getSaveAndContinueButton().should('not.exist');

      ReviewPage.getNewslettersSection().contains('N/A');
      ReviewPage.getConsentsSection().contains('N/A');

      ReviewPage.getMarketingResearchChoice().contains('No');
      ReviewPage.getMarketingAnalysisChoice().contains('No');

      ReviewPage.getReturnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });

    it('uses a default returnUrl if none provided', () => {
      // @TODO: Reliable way of loading this from envs?
      const returnUrl = encodeURIComponent(
        'https://m.code.dev-theguardian.com',
      );

      CommunicationsPage.gotoFlowStart();

      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.idapiMockNext(200);

      CommunicationsPage.getSaveAndContinueButton().click();

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.idapiMockNext(200);

      NewslettersPage.getSaveAndContinueButton().click();

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.getMarketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMockNext(200);

      YourDataPage.getSaveAndContinueButton().click();
      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.getReturnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });
  });

  context('Login middleware', () => {
    it('no sc_gu_u cookie, redirect to login page', () => {
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          'https://profile.code.dev-theguardian.com/signin',
        );
      });
    });

    it('no sc_gu_la cookie, redirect to login page', () => {
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          'https://profile.code.dev-theguardian.com/signin',
        );
      });
    });

    it('email not validated, go to verify email page', () => {
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInRecently',
        emailValidated: false,
        redirect: null,
      };
      cy.idapiMockAll(200, emailNotValidatedResponse, '/auth/redirect');

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
        '/auth/redirect',
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
      cy.idapiMockAll(200, emailNotValidatedResponse, '/auth/redirect');

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
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInNotRecently',
        emailValidated: true,
        redirect: undefined,
      };

      cy.idapiMockAll(200, emailNotValidatedResponse, '/auth/redirect');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          'https://profile.code.dev-theguardian.com/signin',
        );
      });
    });

    it('on idapi error it redirects to the sign in page with the error flag set', () => {
      setAuthCookies();
      cy.idapiMockAll(502, 'gateway error', '/auth/redirect');
      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(302);
        expect(res.redirectedToUrl).to.include(
          'https://profile.code.dev-theguardian.com/signin/signin?error=signin-error-bad-request',
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
        '/auth/redirect',
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
    });

    it('shows correct contact options, none checked by default', () => {
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.getBackButton().should('not.exist');
      CommunicationsPage.getCheckboxes().should('not.be.checked');
    });

    it('shows any previously selected consents', () => {
      const consented = getUserConsents(['jobs', 'offers']);
      cy.idapiMockAll(200, createUser(consented), USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.getBackButton().should('not.exist');
      CommunicationsPage.getConsentCheckboxByTitle('Jobs').should('be.checked');
      CommunicationsPage.getConsentCheckboxByTitle('Offers').should(
        'be.checked',
      );
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.getErrorBanner().contains(USER_ERRORS.GENERIC);
      CommunicationsPage.getBackButton().should('not.exist');
      CommunicationsPage.getSaveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.getErrorBanner().contains(CONSENT_ERRORS.GENERIC);
      CommunicationsPage.getBackButton().should('not.exist');
      CommunicationsPage.getSaveAndContinueButton().should('not.exist');
    });
  });

  context('Newsletters page', () => {
    const { NEWSLETTERS } = NewslettersPage.CONTENT;

    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        '/auth/redirect',
      );
      cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.idapiMockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('correct newsletters shown for uk, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.getNewsletterCheckboxByTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.LONG_READ,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.BOOKMARKS,
      ).should('not.be.checked');

      CommunicationsPage.getBackButton().should('exist');
      CommunicationsPage.getSaveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for United States of America, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AMERICA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.getNewsletterCheckboxByTitle(NEWSLETTERS.TODAY_US).should(
        'not.be.checked',
      );
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.LONG_READ,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.BOOKMARKS,
      ).should('not.be.checked');

      CommunicationsPage.getBackButton().should('exist');
      CommunicationsPage.getSaveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for Australia, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AUSTRALIA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.TODAY_AUS,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.LONG_READ,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.BOOKMARKS,
      ).should('not.be.checked');

      CommunicationsPage.getBackButton().should('exist');
      CommunicationsPage.getSaveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for rest of the world, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.OTHERS);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.getNewsletterCheckboxByTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.LONG_READ,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.BOOKMARKS,
      ).should('not.be.checked');

      CommunicationsPage.getBackButton().should('exist');
      CommunicationsPage.getSaveAndContinueButton().should('exist');
    });

    it('show already selected newsletters', () => {
      const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
      cy.idapiMockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );
      NewslettersPage.goto();

      NewslettersPage.getNewsletterCheckboxByTitle(NEWSLETTERS.TODAY_UK).should(
        'not.be.checked',
      );
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.LONG_READ,
      ).should('be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('be.checked');
      NewslettersPage.getNewsletterCheckboxByTitle(
        NEWSLETTERS.BOOKMARKS,
      ).should('not.be.checked');
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.getErrorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.getBackButton().should('not.exist');
      NewslettersPage.getSaveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.getErrorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.getBackButton().should('not.exist');
      NewslettersPage.getSaveAndContinueButton().should('not.exist');
    });
  });

  context('Your data page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        '/auth/redirect',
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
    });

    it('displays the marketing opt out, unchecked by default', () => {
      YourDataPage.goto();
      YourDataPage.getMarketingOptoutCheckbox().should('not.be.checked');
    });

    it('displays the marketing opt out, checked if the user has previously opted out', () => {
      cy.idapiMockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.getMarketingOptoutCheckbox().should('be.checked');
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.getErrorBanner().contains(USER_ERRORS.GENERIC);
      YourDataPage.getBackButton().should('not.exist');
      YourDataPage.getSaveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.getErrorBanner().contains(CONSENT_ERRORS.GENERIC);
      YourDataPage.getBackButton().should('not.exist');
      YourDataPage.getSaveAndContinueButton().should('not.exist');
    });
  });

  context('Review page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiMockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        '/auth/redirect',
      );
      cy.idapiMockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.idapiMockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      cy.idapiMockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.idapiMockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('displays a relevant error if on consents endpoint failure', () => {
      cy.idapiMockAll(500, {}, CONSENTS_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.getErrorBanner().contains(CONSENT_ERRORS.GENERIC);
    });

    it('display a relevant error message on user end point failure', () => {
      cy.idapiMockAll(500, {}, USER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.getErrorBanner().contains(USER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.getErrorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.idapiMockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.getErrorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });
  });
});
