/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />

const {
  authRedirectSignInRecentlyEmailValidated,
} = require('../support/idapi/auth');
const {
  allConsents,
  defaultUserConsent,
  optedOutUserConsent,
} = require('../support/idapi/consent');
const {
  verifiedUserWithNoConsent,
  createUser,
} = require('../support/idapi/user');
const { setAuthCookies } = require('../support/idapi/cookie');
const CommunicationsPage = require('../support/pages/onboarding/communications_page.js');
const NewslettersPage = require('../support/pages/onboarding/newsletters_page');
const YourDataPage = require('../support/pages/onboarding/your_data_page');
const ReviewPage = require('../support/pages/onboarding/review_page');

const {
  allNewsletters,
  userNewsletters,
} = require('../support/idapi/newsletter');
const Onboarding = require('../support/pages/onboarding/onboarding_page');
const VerifyEmail = require('../support/pages/verify_email');

describe('Onboarding flow', () => {
  beforeEach(() => {
    cy.idapiMockPurge();
  });

  context('Full flow', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.idapiPermaMock(
        200,
        authRedirectSignInRecentlyEmailValidated,
        '/auth/redirect',
      );
      cy.idapiPermaMock(200, allConsents, '/consents');
      cy.idapiPermaMock(200, allNewsletters, '/newsletters');
      cy.idapiPermaMock(200, verifiedUserWithNoConsent, '/user/me');
      cy.idapiPermaMock(200, userNewsletters(), '/users/me/newsletters');
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
      cy.idapiMock(200);

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
      cy.idapiMock(200);

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
      cy.idapiMock(200);

      // user consents mock response for review of consents flow
      cy.idapiPermaMock(200, createUser(consent), '/user/me');

      // mock load user newsletters
      cy.idapiPermaMock(
        200,
        userNewsletters(newslettersToSubscribe),
        '/users/me/newsletters',
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
      cy.idapiMock(200);

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
      cy.idapiMock(200);

      NewslettersPage.getSaveAndContinueButton().click();
      cy.idapiLastPayloadIs([]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.getBackButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.getMarketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMock(200);

      cy.idapiPermaMock(200, createUser(optedOutUserConsent), '/user/me');

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
      cy.idapiMock(200);

      CommunicationsPage.getSaveAndContinueButton().click();

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.idapiMock(200);

      NewslettersPage.getSaveAndContinueButton().click();

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.getMarketingOptoutClickableSection().click();

      // mock form save success
      cy.idapiMock(200);

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
      cy.idapiPermaMock(200, emailNotValidatedResponse, '/auth/redirect');

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
      cy.idapiPermaMock(
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
      cy.idapiPermaMock(200, emailNotValidatedResponse, '/auth/redirect');

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

      cy.idapiPermaMock(200, emailNotValidatedResponse, '/auth/redirect');

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
      cy.idapiPermaMock(502, 'gateway error', '/auth/redirect');
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

  context('Newsletters page', () => {
    // it('correct newsletters shown for uk, none checked by default');
    // it('correct newsletters shown for us, none checked by default');
    // it('correct newsletters shown for aus, none checked by default');
    // it('correct newsletters shown for row/default, none checked by default');
    // it(
    //  'navigate back to newsletters page after saving will preserve newsletters' // @TODO: Not usefully testable with mockserver
    // );
    // it(
    //  'navigate back to newsletters page after will let you change and save selections'
    // );
    // it('generic idapi error');
  });

  context('Contact options page', () => {
    // it('shows correct contact options, none checked by default');
    // it(
    //  'navigate back to contact options page after saving will preserve consents' // @TODO: Not usefully testable with mockserver
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
