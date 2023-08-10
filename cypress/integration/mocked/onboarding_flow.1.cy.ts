/* eslint-disable @typescript-eslint/no-var-requires */

import { injectAndCheckAxe } from '../../support/cypress-axe';
import {
	AUTH_REDIRECT_ENDPOINT,
	authRedirectSignInRecentlyEmailValidated,
} from '../../support/idapi/auth';
import {
	CONSENTS_ENDPOINT,
	CONSENT_ERRORS,
	allConsents,
	defaultUserConsent,
	getUserConsents,
	optedIntoPersonalisedAdvertisingUserConsent,
	optedOutUserConsent,
} from '../../support/idapi/consent';
import { setAuthCookies } from '../../support/idapi/cookie';
import {
	USER_CONSENTS_ENDPOINT,
	USER_ENDPOINT,
	createUser,
	verifiedUserWithNoConsent,
} from '../../support/idapi/user';
import CommunicationsPage from '../../support/pages/onboarding/communications_page';
import NewslettersPage from '../../support/pages/onboarding/newsletters_page';
import ReviewPage from '../../support/pages/onboarding/review_page';
import YourDataPage from '../../support/pages/onboarding/your_data_page';

import { setMvtId } from '../../support/commands/setMvtId';
import {
	GEOLOCATION_CODES,
	getGeoLocationHeaders,
} from '../../support/geolocation';
import {
	NEWSLETTER_ENDPOINT,
	NEWSLETTER_ERRORS,
	NEWSLETTER_SUBSCRIPTION_ENDPOINT,
	allNewsletters,
	userNewsletters,
} from '../../support/idapi/newsletter';
import Onboarding from '../../support/pages/onboarding/onboarding_page';
import VerifyEmail from '../../support/pages/verify_email';
import OurContentPage from '../../support/pages/onboarding/our_content_page';

const { NEWSLETTERS } = NewslettersPage.CONTENT;

// TODO: remove this once we have migrated fully to OAuth as we're unable to mock the OAuth flow to get Tokens
// TODO: best thing to do will move as much as possible to the ete tests
describe('Onboarding flow', () => {
	beforeEach(() => {
		cy.mockPurge();
		setMvtId('0');
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
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
			cy.mockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
		});

		it('goes through full flow, opt in all consents/newsletters, preserve returnUrl', () => {
			const newslettersToSubscribe = [
				{ listId: 4147 },
				{ listId: 4156 },
				{ listId: 4165 },
			];

			const consent = defaultUserConsent.map(({ id }) => {
				// eslint-disable-next-line functional/no-let
				let consented = true;
				if (id.includes('_optout')) {
					consented = false;
				}
				if (id.includes('personalised_advertising')) {
					consented = true;
				}
				return {
					id,
					consented,
				};
			});

			const returnUrl = encodeURIComponent(
				`https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
			);

			cy.enableCMP();
			CommunicationsPage.gotoFlowStart({
				query: {
					returnUrl,
					useIdapi: 'true',
				},
			});
			cy.acceptCMP();
			cy.setCookie('GU_geo_country', 'FR');
			cy.url().should('include', CommunicationsPage.URL);
			cy.url().should('include', `returnUrl=${returnUrl}`);
			cy.get('input[name=_cmpConsentedState]').should('have.value', 'true');
			CommunicationsPage.backButton().should('not.exist');
			CommunicationsPage.allCheckboxes().should('not.be.checked');
			CommunicationsPage.allCheckboxes().click({ multiple: true });

			// mock form save success
			cy.mockNext(200);

			CommunicationsPage.saveAndContinueButton().click();
			cy.lastPayloadsAre([
				[{ id: 'supporter', consented: true }],
				{ privateFields: { registrationLocation: 'Europe' } },
			]);

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

			cy.lastPayloadsAre([
				[
					{ id: '4147', subscribed: true },
					{ id: '4156', subscribed: true },
					{ id: '4165', subscribed: true },
				],
				[{ id: 'events', consented: true }],
			]);

			cy.url().should('include', YourDataPage.URL);
			cy.url().should('include', `returnUrl=${returnUrl}`);

			YourDataPage.backButton()
				.should('have.attr', 'href')
				.and('include', NewslettersPage.URL);

			YourDataPage.personalisedAdvertisingOptInInput().should('not.be.checked');

			YourDataPage.personalisedAdvertisingOptInSwitch().click();
			YourDataPage.marketingOptInSwitch().should('be.checked');
			YourDataPage.personalisedAdvertisingOptInInput().should('be.checked');
			// mock form save success
			cy.mockNext(200);

			// user consents mock response for review of consents flow
			cy.mockAll(200, createUser(consent), USER_ENDPOINT);
			cy.mockAll(200, consent, USER_CONSENTS_ENDPOINT);

			// mock load user newsletters
			cy.mockAll(
				200,
				userNewsletters(newslettersToSubscribe),
				NEWSLETTER_SUBSCRIPTION_ENDPOINT,
			);

			YourDataPage.saveAndContinueButton().click();
			// Explicity check '_optin' consents are in inverted back to '_optouts' when posted
			cy.lastPayloadIs([
				{ id: 'profiling_optout', consented: false },
				{ id: 'personalised_advertising', consented: true },
			]);

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
			cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT);

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
					useIdapi: 'true',
				},
			});

			cy.url().should('include', CommunicationsPage.URL);
			cy.url().should('include', `returnUrl=${returnUrl}`);

			CommunicationsPage.backButton().should('not.exist');

			CommunicationsPage.allCheckboxes().should('not.be.checked');
			cy.get('input[name=_cmpConsentedState]').should('have.value', 'false');

			// mock form save success
			cy.mockNext(200);

			CommunicationsPage.saveAndContinueButton().click();

			// Use .lastPayloadsAre to ensure the IDAPI registrationLocation update is NOT posted
			cy.lastPayloadsAre([[{ id: 'supporter', consented: false }]]);

			cy.url().should('include', NewslettersPage.URL);
			cy.url().should('include', `returnUrl=${returnUrl}`);

			NewslettersPage.backButton()
				.should('have.attr', 'href')
				.and('include', CommunicationsPage.URL);

			// mock form save success
			cy.mockNext(200);

			cy.enableCMP();
			NewslettersPage.saveAndContinueButton().click();
			cy.lastPayloadsAre([[], [{ id: 'events', consented: false }]]);
			cy.acceptCMP();

			cy.url().should('include', YourDataPage.URL);
			cy.url().should('include', `returnUrl=${returnUrl}`);

			YourDataPage.backButton()
				.should('have.attr', 'href')
				.and('include', NewslettersPage.URL);

			YourDataPage.marketingOptInSwitch().should('be.checked');
			YourDataPage.marketingOptInClickableSection().click();
			YourDataPage.marketingOptInSwitch().should('not.be.checked');
			YourDataPage.personalisedAdvertisingOptInSwitch().should('exist');
			YourDataPage.personalisedAdvertisingOptInInput().should('not.be.checked');

			// mock form save success
			cy.mockNext(200);

			cy.mockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
			cy.mockAll(200, optedOutUserConsent, USER_CONSENTS_ENDPOINT);

			YourDataPage.saveAndContinueButton().click();
			// Explicity check '_optin' consents are in inverted back to '_optouts' when posted
			cy.lastPayloadIs([
				{ id: 'profiling_optout', consented: true },
				{ id: 'personalised_advertising', consented: false },
			]);

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
			cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT).should(
				'not.exist',
			);

			// contains messaging encouraging user to explore other newsletters
			cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE);

			ReviewPage.returnButton()
				.should('have.attr', 'href')
				.and('include', decodeURIComponent(returnUrl));
		});
		//@AB_TEST: 3 Stage Registration Flow Test START
		describe('AB Test 3 stage registration flow', () => {
			beforeEach(() => {
				setMvtId('2');
			});
			it('full 3 stage flow, opt in to marketing and newsletters, preserve url', () => {
				const newslettersToSubscribe = [
					{ listId: 4147 },
					{ listId: 4156 },
					{ listId: 4165 },
				];

				const consent = defaultUserConsent.map(({ id }) => {
					// eslint-disable-next-line functional/no-let
					let consented = true;
					if (id.includes('_optout')) {
						consented = false;
					}
					if (id.includes('personalised_advertising')) {
						consented = true;
					}
					return {
						id,
						consented,
					};
				});

				const returnUrl = encodeURIComponent(
					`https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
				);

				cy.enableCMP();
				OurContentPage.gotoFlowStart({
					query: {
						returnUrl,
						useIdapi: 'true',
					},
				});
				cy.acceptCMP();
				cy.setCookie('GU_geo_country', 'FR');
				cy.url().should('include', OurContentPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);
				cy.get('input[name=_cmpConsentedState]').should('have.value', 'true');
				OurContentPage.backButton().should('not.exist');
				OurContentPage.allCheckboxes().should('not.be.checked');
				OurContentPage.allCheckboxes().click({ multiple: true });

				// mock form save success
				cy.mockNext(200);

				OurContentPage.saveAndContinueButton().click();
				cy.lastPayloadsAre([
					[
						{ id: '4147', subscribed: true },
						{ id: '4156', subscribed: true },
						{ id: '4165', subscribed: true },
					],
					[
						{ id: 'supporter', consented: true },
						{ id: 'events', consented: true },
					],
					{ privateFields: { registrationLocation: 'Europe' } },
				]);

				cy.url().should('include', YourDataPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				YourDataPage.backButton()
					.should('have.attr', 'href')
					.and('include', OurContentPage.URL);

				YourDataPage.personalisedAdvertisingOptInInput().should(
					'not.be.checked',
				);

				YourDataPage.personalisedAdvertisingOptInSwitch().click();
				YourDataPage.marketingOptInSwitch().should('be.checked');
				YourDataPage.personalisedAdvertisingOptInInput().should('be.checked');
				// mock form save success
				cy.mockNext(200);

				// user consents mock response for review of consents flow
				cy.mockAll(200, createUser(consent), USER_ENDPOINT);
				cy.mockAll(200, consent, USER_CONSENTS_ENDPOINT);

				// mock load user newsletters
				cy.mockAll(
					200,
					userNewsletters(newslettersToSubscribe),
					NEWSLETTER_SUBSCRIPTION_ENDPOINT,
				);

				YourDataPage.saveAndContinueButton().click();
				// Explicity check '_optin' consents are in inverted back to '_optouts' when posted
				cy.lastPayloadIs([
					{ id: 'profiling_optout', consented: false },
					{ id: 'personalised_advertising', consented: true },
				]);

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
				cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT);

				// does not contain messaging encouraging user to consider other newsletters
				cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should(
					'not.exist',
				);

				ReviewPage.returnButton()
					.should('have.attr', 'href')
					.and('include', decodeURIComponent(returnUrl));
			});
			it('full 3 stage flow, opt out all consents/newsletters, preserve returnUrl', () => {
				const returnUrl = encodeURIComponent(
					`https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
				);

				OurContentPage.gotoFlowStart({
					query: {
						returnUrl,
						useIdapi: 'true',
					},
				});
				// cy.acceptCMP();
				cy.url().should('include', OurContentPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				OurContentPage.backButton().should('not.exist');

				OurContentPage.allCheckboxes().should('not.be.checked');
				cy.get('input[name=_cmpConsentedState]').should('have.value', 'false');

				// mock form save success
				cy.mockNext(200);
				cy.enableCMP();
				OurContentPage.saveAndContinueButton().click();
				cy.acceptCMP();

				// Use .lastPayloadsAre to ensure the IDAPI registrationLocation update is NOT posted
				cy.lastPayloadsAre([
					[
						{ id: 'supporter', consented: false },
						{ id: 'events', consented: false },
					],
					[],
				]);
				cy.url().should('include', YourDataPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				YourDataPage.backButton()
					.should('have.attr', 'href')
					.and('include', OurContentPage.URL);

				YourDataPage.marketingOptInSwitch().should('be.checked');
				YourDataPage.marketingOptInClickableSection().click();
				YourDataPage.marketingOptInSwitch().should('not.be.checked');
				YourDataPage.personalisedAdvertisingOptInSwitch().should('exist');
				YourDataPage.personalisedAdvertisingOptInInput().should(
					'not.be.checked',
				);

				// mock form save success
				cy.mockNext(200);

				cy.mockAll(200, createUser(optedOutUserConsent), USER_ENDPOINT);
				cy.mockAll(200, optedOutUserConsent, USER_CONSENTS_ENDPOINT);

				YourDataPage.saveAndContinueButton().click();
				// Explicity check '_optin' consents are in inverted back to '_optouts' when posted
				cy.lastPayloadIs([
					{ id: 'profiling_optout', consented: true },
					{ id: 'personalised_advertising', consented: false },
				]);

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
				cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT).should(
					'not.exist',
				);

				// contains messaging encouraging user to explore other newsletters
				cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE);

				ReviewPage.returnButton()
					.should('have.attr', 'href')
					.and('include', decodeURIComponent(returnUrl));
			});
		});
		//@AB_TEST: 3 Stage Registration Flow Test END

		it('uses a default returnUrl if none provided', () => {
			const returnUrl = encodeURIComponent(Cypress.env('DEFAULT_RETURN_URI'));

			CommunicationsPage.gotoFlowStart({
				query: {
					useIdapi: 'true',
				},
			});

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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
				url: `${Onboarding.URL}?useIdapi=true`,
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
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('had no detectable a11y voilations if previously selected consents', () => {
			const consented = getUserConsents(['jobs', 'offers']);
			cy.mockAll(200, consented, USER_CONSENTS_ENDPOINT);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on with an error', () => {
			cy.mockAll(500, {}, USER_ENDPOINT);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('shows correct contact options, none checked by default', () => {
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			CommunicationsPage.backButton().should('not.exist');
			CommunicationsPage.allCheckboxes().should('not.be.checked');
		});

		it('shows any previously selected consents', () => {
			const consented = getUserConsents(['supporter']);
			cy.mockAll(200, consented, USER_CONSENTS_ENDPOINT);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			CommunicationsPage.backButton().should('not.exist');
			CommunicationsPage.consentCheckboxWithTitle(
				'Supporting the Guardian',
			).should('be.checked');
		});

		it('displays a relevant error message on user end point failure', () => {
			cy.mockAll(500, {}, USER_CONSENTS_ENDPOINT);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
			CommunicationsPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
			CommunicationsPage.backButton().should('not.exist');
			CommunicationsPage.saveAndContinueButton().should('not.exist');
		});

		it('displays a relevant error on consents endpoint failure', () => {
			cy.mockAll(500, {}, CONSENTS_ENDPOINT);
			CommunicationsPage.goto({
				query: {
					useIdapi: true,
				},
			});
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
			cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
		});

		it('has no detectable a11y violations', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });
			injectAndCheckAxe();
		});

		it('had no detectable a11y voilations if previously selected newsletter', () => {
			const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
			cy.mockAll(
				200,
				userNewsletters(newslettersToSubscribe),
				NEWSLETTER_SUBSCRIPTION_ENDPOINT,
			);
			NewslettersPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on with an error', () => {
			cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
			NewslettersPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('correct newsletters shown for uk, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.GB);

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIRST_EDITION_UK).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.LONG_READ).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(
				NewslettersPage.CONTENT.Consents.EVENTS,
			).should('not.be.checked');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('correct newsletters shown for United States of America, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AMERICA);

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIRST_THING_US).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.LONG_READ).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(
				NewslettersPage.CONTENT.Consents.EVENTS,
			).should('not.be.checked');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('correct newsletters shown for permissioned United States browser, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AMERICA);
			cy.setEncryptedStateCookie({
				isCmpConsented: true,
			});

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIRST_THING_US).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.HEADLINES_US).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.OPINION_US).should(
				'not.be.checked',
			);

			cy.contains(NewslettersPage.CONTENT.Consents.EVENTS).should('not.exist');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('correct newsletters shown for Australia, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AUSTRALIA);

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.MORNING_MAIL_AU).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.LONG_READ).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(
				NewslettersPage.CONTENT.Consents.EVENTS,
			).should('not.be.checked');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('correct localised newsletters shown for permissioned Australian browser, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.AUSTRALIA);

			cy.setEncryptedStateCookie({
				isCmpConsented: true,
			});
			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.MORNING_MAIL_AU).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.AFTERNOON_UPDATE_AU).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIVE_GREAT_READS_AU).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.SAVED_FOR_LATER_AU).should(
				'not.be.checked',
			);
			cy.contains(NewslettersPage.CONTENT.Consents.EVENTS).should('not.exist');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('correct newsletters shown for rest of the world, none checked by default', () => {
			const headers = getGeoLocationHeaders(GEOLOCATION_CODES.OTHERS);

			cy.visit(NewslettersPage.URL, { headers, qs: { useIdapi: 'true' } });

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIRST_EDITION_UK).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.LONG_READ).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(
				NewslettersPage.CONTENT.Consents.EVENTS,
			).should('not.be.checked');

			CommunicationsPage.backButton().should('exist');
			CommunicationsPage.saveAndContinueButton().should('exist');
		});

		it('show already selected newsletters / consents', () => {
			const newslettersToSubscribe = [{ listId: 4147 }, { listId: 4165 }];
			cy.mockAll(
				200,
				userNewsletters(newslettersToSubscribe),
				NEWSLETTER_SUBSCRIPTION_ENDPOINT,
			);
			const consented = getUserConsents(['events']);
			cy.mockAll(200, consented, USER_CONSENTS_ENDPOINT);
			NewslettersPage.goto({
				query: {
					useIdapi: true,
				},
			});

			NewslettersPage.checkboxWithTitle(NEWSLETTERS.FIRST_EDITION_UK).should(
				'not.be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.LONG_READ).should(
				'be.checked',
			);
			NewslettersPage.checkboxWithTitle(NEWSLETTERS.GREEN_LIGHT).should(
				'be.checked',
			);
			NewslettersPage.checkboxWithTitle(
				NewslettersPage.CONTENT.Consents.EVENTS,
			).should('be.checked');
		});

		it('displays a relevant error on newsletters endpoint failure', () => {
			cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
			NewslettersPage.goto({
				query: {
					useIdapi: true,
				},
			});
			NewslettersPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
			NewslettersPage.backButton().should('not.exist');
			NewslettersPage.saveAndContinueButton().should('not.exist');
		});

		it('displays a relevant error on newsletters subscription endpoint failure', () => {
			cy.mockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
			NewslettersPage.goto({
				query: {
					useIdapi: true,
				},
			});
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
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
		});

		it('has no detectable a11y violations', () => {
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('had no detectable a11y voilations if previously selected consent', () => {
			cy.mockAll(200, optedOutUserConsent, USER_CONSENTS_ENDPOINT);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on with an error', () => {
			cy.mockAll(500, {}, CONSENTS_ENDPOINT);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('displays the marketing profile opt in switch, toggled ON by default', () => {
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			YourDataPage.marketingOptInSwitch().should('be.checked');
		});

		it('displays the marketing profile opt in switch, toggled OFF if the user has previously opted out', () => {
			cy.mockAll(200, optedOutUserConsent, USER_CONSENTS_ENDPOINT);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			YourDataPage.marketingOptInSwitch().should('not.be.checked');
		});

		it('displays the personalised advertising permission if user has all CMP consents, toggled OFF by default', () => {
			cy.enableCMP();
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			cy.acceptCMP();

			YourDataPage.marketingOptInSwitch().should('be.checked');
			YourDataPage.personalisedAdvertisingOptInInput().should('not.be.checked');
		});

		it('displays the personalised advertising permission if user has all CMP consents, toggled ON if user previously opted in', () => {
			cy.enableCMP();
			cy.mockAll(
				200,
				optedIntoPersonalisedAdvertisingUserConsent,
				USER_CONSENTS_ENDPOINT,
			);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			cy.acceptCMP();

			YourDataPage.marketingOptInSwitch().should('be.checked');
			YourDataPage.personalisedAdvertisingOptInInput().should('be.checked');
		});

		it('does not display the personalised advertising permission if user does not have CMP consents set', () => {
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			YourDataPage.personalisedAdvertisingOptIn().should('not.exist');
		});

		it('does not display the personalised advertising permission if user has not accepted CMP consents', () => {
			cy.enableCMP();
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			cy.declineCMP();

			YourDataPage.personalisedAdvertisingOptIn().should('not.exist');
		});

		it('does not display the personalised advertising permission if user has all CMP consents, but has an ad free gu cookie', () => {
			cy.enableCMP();
			cy.setAdFreeCookie();
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			cy.acceptCMP();

			YourDataPage.personalisedAdvertisingOptIn().should('not.exist');
		});

		it('display a relevant error message on user end point failure', () => {
			cy.mockAll(500, {}, USER_CONSENTS_ENDPOINT);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
			YourDataPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
			YourDataPage.backButton().should('not.exist');
			YourDataPage.saveAndContinueButton().should('not.exist');
		});

		it('displays a relevant error on consents endpoint failure', () => {
			cy.mockAll(500, {}, CONSENTS_ENDPOINT);
			YourDataPage.goto({
				query: {
					useIdapi: true,
				},
			});
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
			cy.mockAll(
				200,
				verifiedUserWithNoConsent.user.consents,
				USER_CONSENTS_ENDPOINT,
			);
			cy.mockAll(200, allNewsletters, NEWSLETTER_ENDPOINT);
			cy.mockAll(200, userNewsletters(), NEWSLETTER_SUBSCRIPTION_ENDPOINT);
		});

		it('has no detectable a11y violations', () => {
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on with an error', () => {
			cy.mockAll(500, {}, CONSENTS_ENDPOINT);
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
			injectAndCheckAxe();
		});

		it('displays a relevant error if on consents endpoint failure', () => {
			cy.mockAll(500, {}, CONSENTS_ENDPOINT);
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
			ReviewPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
		});

		it('display a relevant error message on user end point failure', () => {
			cy.mockAll(500, {}, USER_CONSENTS_ENDPOINT);
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
			ReviewPage.errorBanner().contains(CONSENT_ERRORS.GENERIC);
		});

		it('displays a relevant error on newsletters endpoint failure', () => {
			cy.mockAll(500, {}, NEWSLETTER_ENDPOINT);
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
			ReviewPage.errorBanner().contains(NEWSLETTER_ERRORS.GENERIC);
		});

		it('displays a relevant error on newsletters subscription endpoint failure', () => {
			cy.mockAll(500, {}, NEWSLETTER_SUBSCRIPTION_ENDPOINT);
			ReviewPage.goto({
				query: {
					useIdapi: true,
				},
			});
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
			cy.visit('/consents/unknown', {
				failOnStatusCode: false,
				qs: { useIdapi: true },
			});
			cy.contains('the page does not exist');
		});
	});
});
