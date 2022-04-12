/* eslint-disable @typescript-eslint/no-var-requires */

import {
  authRedirectSignInRecentlyEmailValidated,
  AUTH_REDIRECT_ENDPOINT,
} from '../../support/idapi/auth';
import {
  allConsents,
  defaultUserConsent,
  optedOutUserConsent,
  getUserConsents,
  CONSENTS_ENDPOINT,
  CONSENT_ERRORS,
} from '../../support/idapi/consent';
import {
  verifiedUserWithNoConsent,
  createUser,
  USER_ERRORS,
  USER_ENDPOINT,
} from '../../support/idapi/user';
import { setAuthCookies } from '../../support/idapi/cookie';
import CommunicationsPage from '../../support/pages/onboarding/communications_page';
import NewslettersPage from '../../support/pages/onboarding/newsletters_page';
import YourDataPage from '../../support/pages/onboarding/your_data_page';
import ReviewPage from '../../support/pages/onboarding/review_page';
import { injectAndCheckAxe } from '../../support/cypress-axe';

import {
  allNewsletters,
  userNewsletters,
  NEWSLETTER_ENDPOINT,
  NEWSLETTER_SUBSCRIPTION_ENDPOINT,
  NEWSLETTER_ERRORS,
} from '../../support/idapi/newsletter';
import Onboarding from '../../support/pages/onboarding/onboarding_page';
import VerifyEmail from '../../support/pages/verify_email';
import {
  getGeoLocationHeaders,
  GEOLOCATION_CODES,
} from '../../support/geolocation';

const { NEWSLETTERS } = NewslettersPage.CONTENT;

describe('Onboarding flow', () => {
  beforeEach(() => {
    cy.mockPurge();
  });

  context('Full flow', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      cy.mockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('goes through full flow, opt in all consents/newsletters, preserve returnUrl', () => {
      const newslettersToSubscribe = [
        { listId: 4147 },
        { listId: 4156 },
        { listId: 6006 },
        { listId: 4165 },
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
      CommunicationsPage.allCheckboxes().click({ multiple: true });

      // mock form save success
      cy.mockNext(200);

      CommunicationsPage.saveAndContinueButton().click();
      cy.lastPayloadIs([{ id: 'supporter', consented: true }]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.backButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      NewslettersPage.allCheckboxes()
        .should('not.be.checked')
        .click({ multiple: true });

      // mock form save success
      cy.mockNext(200);

      NewslettersPage.saveAndContinueButton().click();

      cy.lastPayloadIs([
        { id: '4147', subscribed: true },
        { id: '4156', subscribed: true },
        { id: '6006', subscribed: true },
        { id: '4165', subscribed: true },
      ]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.backButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.allCheckboxes().should('be.checked');

      // mock form save success
      cy.mockNext(200);

      // user consents mock response for review of consents flow
      cy.mockAll(200, createUser(consent), USER_ENDPOINT);

      // mock load user newsletters
      cy.mockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );

      YourDataPage.saveAndContinueButton().click();
      // Explicity check '_optin' consents are in inverted back to '_optouts' when posted
      cy.lastPayloadIs([{ id: 'profiling_optout', consented: false }]);

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.backButton().should('not.exist');
      ReviewPage.saveAndContinueButton().should('not.exist');

      // contains opted in newsletters
      Object.values(ReviewPage.CONTENT.NEWSLETTERS).forEach((newsletter) =>
        cy.contains(newsletter),
      );

      // contains consents
      cy.contains(ReviewPage.CONTENT.SUPPORTER_CONSENT);
      cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT);

      // does not contain messaging encouraging user to consider other newsletters
      cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should('not.exist');

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

      // mock form save success
      cy.mockNext(200);

      CommunicationsPage.saveAndContinueButton().click();
      cy.lastPayloadIs([{ id: 'supporter', consented: false }]);

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      NewslettersPage.backButton()
        .should('have.attr', 'href')
        .and('include', CommunicationsPage.URL);

      // mock form save success
      cy.mockNext(200);

      NewslettersPage.saveAndContinueButton().click();
      cy.lastPayloadIs([]);

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.backButton()
        .should('have.attr', 'href')
        .and('include', NewslettersPage.URL);

      YourDataPage.marketingOptInClickableSection().click();

      // mock form save success
      cy.mockNext(200);

      cy.mockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);

      YourDataPage.saveAndContinueButton().click();
      // Explicity check '_optin' consents are in inverted back to '_optouts' when posted
      cy.lastPayloadIs([{ id: 'profiling_optout', consented: true }]);

      cy.url().should('include', ReviewPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      ReviewPage.backButton().should('not.exist');
      ReviewPage.saveAndContinueButton().should('not.exist');

      // contains no opted in newsletters
      Object.values(ReviewPage.CONTENT.NEWSLETTERS).forEach((newsletter) =>
        cy.contains(newsletter).should('not.exist'),
      );

      // contains no consents
      cy.contains(ReviewPage.CONTENT.SUPPORTER_CONSENT).should('not.exist');
      cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT).should('not.exist');

      // contains messaging encouraging user to explore other newsletters
      cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE);

      ReviewPage.returnButton()
        .should('have.attr', 'href')
        .and('include', decodeURIComponent(returnUrl));
    });

    it('uses a default returnUrl if none provided', () => {
      const returnUrl = encodeURIComponent(Cypress.env('DEFAULT_RETURN_URI'));

      CommunicationsPage.gotoFlowStart();

      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.mockNext(200);

      CommunicationsPage.saveAndContinueButton().click();

      cy.url().should('include', NewslettersPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      // mock form save success
      cy.mockNext(200);

      NewslettersPage.saveAndContinueButton().click();

      cy.url().should('include', YourDataPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);

      YourDataPage.marketingOptInClickableSection().click();

      // mock form save success
      cy.mockNext(200);

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
      const signInUrl = Cypress.env('SIGN_IN_PAGE_URL');
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(signInUrl);
      });
    });

    it('no sc_gu_la cookie, redirect to login page', () => {
      const signInUrl = Cypress.env('SIGN_IN_PAGE_URL');
      cy.setCookie('GU_U', 'FAKE_GU_U');
      cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
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
      cy.mockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

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
      cy.mockAll(
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
      cy.mockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(
          'https://fakeloginfortest.code.dev-theguardian.co.uk',
        );
      });
    });

    it('if missing redirect information, it redirects to the default ', () => {
      const signInUrl = Cypress.env('SIGN_IN_PAGE_URL');
      setAuthCookies();
      const emailNotValidatedResponse = {
        signInStatus: 'signedInNotRecently',
        emailValidated: true,
        redirect: undefined,
      };

      cy.mockAll(200, emailNotValidatedResponse, AUTH_REDIRECT_ENDPOINT);

      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(signInUrl);
      });
    });

    it('on idapi error it redirects to the sign in page with the error flag set', () => {
      setAuthCookies();
      cy.mockAll(502, 'gateway error', AUTH_REDIRECT_ENDPOINT);
      cy.request({
        url: Onboarding.URL,
        followRedirect: false,
      }).then((res) => {
        expect(res.status).to.eq(303);
        expect(res.redirectedToUrl).to.include(
          `error=signin-error-bad-request`,
        );
      });
    });
  });

  context('Contact options page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected consents', () => {
      const consented = getUserConsents(['jobs', 'offers']);
      cy.mockAll(200, createUser(consented), USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.mockAll(500, {}, USER_ENDPOINT);
      CommunicationsPage.goto();
      injectAndCheckAxe();
    });

    it('shows correct contact options, none checked by default', () => {
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.allCheckboxes().should('not.be.checked');
    });

    it('shows any previously selected consents', () => {
      const consented = getUserConsents(['supporter']);
      cy.mockAll(200, createUser(consented), USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.consentCheckboxWithTitle(
        'Supporting the Guardian',
      ).should('be.checked');
    });

    it('displays a relevant error message on user end point failure', () => {
      cy.mockAll(500, {}, USER_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.errorBanner().contains(USER_ERRORS.GENERIC);
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.mockAll(500, {}, CONSENTS_ENDPOINT);
      CommunicationsPage.goto();
      CommunicationsPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
      CommunicationsPage.backButton().should('not.exist');
      CommunicationsPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Newsletters page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.mockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

      cy.visit(NewslettersPage.URL, { headers });
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected newsletter', () => {
      const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
      cy.mockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );
      NewslettersPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
      NewslettersPage.goto();
      injectAndCheckAxe();
    });

    it('correct newsletters shown for uk, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.MORNING_BRIEFING_UK,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.THE_GUIDE).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for United States of America, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AMERICA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.MORNING_BRIEFING_US,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.THE_GUIDE).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for Australia, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AUSTRALIA);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.MORNING_BRIEFING_AUS,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.THE_GUIDE).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('correct newsletters shown for rest of the world, none checked by default', () => {
      const headers = getGeoLocationHeaders(GEOLOCATION_CODES.OTHERS);

      cy.visit(NewslettersPage.URL, { headers });

      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.MORNING_BRIEFING_UK,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'not.be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.THE_GUIDE).should(
        'not.be.checked',
      );

      CommunicationsPage.backButton().should('exist');
      CommunicationsPage.saveAndContinueButton().should('exist');
    });

    it('show already selected newsletters', () => {
      const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
      cy.mockAll(
        200,
        userNewsletters(newslettersToSubscribe),
        NEWSLETTER_SUBSCRIPTION_ENDPOINT,
      );
      NewslettersPage.goto();

      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.MORNING_BRIEFING_UK,
      ).should('not.be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.LONG_READ).should(
        'be.checked',
      );
      NewslettersPage.newsletterCheckboxWithTitle(
        NEWSLETTERS.GREEN_LIGHT,
      ).should('be.checked');
      NewslettersPage.newsletterCheckboxWithTitle(NEWSLETTERS.THE_GUIDE).should(
        'not.be.checked',
      );
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.backButton().should('not.exist');
      NewslettersPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.mockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      NewslettersPage.goto();
      NewslettersPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
      NewslettersPage.backButton().should('not.exist');
      NewslettersPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Your data page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('had no detectable a11y voilations if previously selected consent', () => {
      cy.mockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.mockAll(500, {}, CONSENTS_ENDPOINT);
      YourDataPage.goto();
      injectAndCheckAxe();
    });

    it('displays the marketing profile opt in switch, toggled ON by default', () => {
      YourDataPage.goto();
      YourDataPage.marketingOptInSwitch().should('be.checked');
    });

    it('displays the marketing profile opt in switch, toggled OFF if the user has previously opted out', () => {
      cy.mockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.marketingOptInSwitch().should('not.be.checked');
    });

    it('display a relevant error message on user end point failure', () => {
      cy.mockAll(500, {}, USER_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.errorBanner().contains(USER_ERRORS.GENERIC);
      YourDataPage.backButton().should('not.exist');
      YourDataPage.saveAndContinueButton().should('not.exist');
    });

    it('displays a relevant error on consents endpoint failure', () => {
      cy.mockAll(500, {}, CONSENTS_ENDPOINT);
      YourDataPage.goto();
      YourDataPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
      YourDataPage.backButton().should('not.exist');
      YourDataPage.saveAndContinueButton().should('not.exist');
    });
  });

  context('Review page', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      cy.mockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
      cy.mockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
    });

    it('has no detectable a11y violations', () => {
      ReviewPage.goto();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on with an error', () => {
      cy.mockAll(500, {}, CONSENTS_ENDPOINT);
      ReviewPage.goto();
      injectAndCheckAxe();
    });

    it('displays a relevant error if on consents endpoint failure', () => {
      cy.mockAll(500, {}, CONSENTS_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
    });

    it('display a relevant error message on user end point failure', () => {
      cy.mockAll(500, {}, USER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(USER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters endpoint failure', () => {
      cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });

    it('displays a relevant error on newsletters subscription endpoint failure', () => {
      cy.mockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
      ReviewPage.goto();
      ReviewPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
    });
  });

  context('Not found', () => {
    beforeEach(() => {
      setAuthCookies();
      cy.mockAll(
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
});
