/* eslint-disable @typescript-eslint/no-var-requires */
import { injectAndCheckAxe } from '../../support/cypress-axe';
import { authRedirectSignInRecentlyEmailValidated } from '../../support/idapi/auth';
import { CONSENTS_ENDPOINT, allConsents } from '../../support/idapi/consent';
import { authCookieResponse, setAuthCookies } from '../../support/idapi/cookie';
import {
	NEWSLETTER_ENDPOINT,
	NEWSLETTER_SUBSCRIPTION_ENDPOINT,
	allNewsletters,
	userNewsletters,
} from '../../support/idapi/newsletter';
import {
	USER_CONSENTS_ENDPOINT,
	USER_ENDPOINT,
	verifiedUserWithNoConsent,
} from '../../support/idapi/user';
import {
	validationTokenExpired,
	validationTokenInvalid,
} from '../../support/idapi/verify_email';
import VerifyEmail from '../../support/pages/verify_email';

describe('Verify email flow', () => {
	const verifyEmailFlow = new VerifyEmail();

	beforeEach(() => {
		cy.mockPurge();
		cy.visit('/signin?useIdapi=true');
	});

	context('A11y checks', () => {
		it('has no detectable a11y violations on logged out resend validation email page', () => {
			// mock token expired
			cy.mockNext(403, validationTokenExpired);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', { failOnStatusCode: false });

			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on logged in resend validation email page', () => {
			// set logged in cookies
			setAuthCookies();

			// mock token expired
			cy.mockNext(403, validationTokenExpired);

			// mock user response
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock user response again for sending validation email
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock validation email sent
			cy.mockNext(200);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', { failOnStatusCode: false });

			// check a11y before clicking send email
			injectAndCheckAxe();

			// click on send link button
			cy.contains(VerifyEmail.CONTENT.SEND_LINK).click();
			// check a11y after clicking send email
			injectAndCheckAxe();
		});
	});

	context('Verify email', () => {
		beforeEach(() => {
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

		it('successfully verifies the email using a token and sets auth cookies', () => {
			// mock validation success response (200 with auth cookies)
			cy.mockNext(200, authCookieResponse);

			// set these cookies manually
			// TODO: can cypress set the automatically?
			setAuthCookies();

			// set successful auth using login middleware
			cy.mockNext(200, authRedirectSignInRecentlyEmailValidated);

			// go to verify email endpoint
			verifyEmailFlow.goto('avalidtoken', { query: { useIdapi: 'true' } });

			// check if signed in success text exists
			cy.contains("You're signed in! Welcome to the Guardian.");

			// check if we're on the new account review page
			cy.url().should('include', '/welcome/review');
		});

		it('successfully verifies the email using a token and sets auth cookies, and preserves encoded return url', () => {
			// mock validation success response (200 with auth cookies)
			cy.mockNext(200, authCookieResponse);

			// set these cookies manually
			// TODO: can cypress set the automatically?
			setAuthCookies();

			// set successful auth using login middleware
			cy.mockNext(200, authRedirectSignInRecentlyEmailValidated);

			const returnUrl = encodeURIComponent(
				`https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
			);

			// go to verify email endpoint
			verifyEmailFlow.goto('avalidtoken', {
				query: {
					returnUrl,
					useIdapi: 'true',
				},
			});

			// check if signed in success text exists
			cy.contains("You're signed in! Welcome to the Guardian.");

			// check if we're on the new account review page
			cy.url().should('include', '/welcome/review');

			// check return url exists
			cy.url().should('include', `returnUrl=${returnUrl}`);
		});

		it('successfully verifies the email using a token and sets auth cookies, and preserves and encodes return url', () => {
			// mock validation success response (200 with auth cookies)
			cy.mockNext(200, authCookieResponse);

			// set these cookies manually
			// TODO: can cypress set the automatically?
			setAuthCookies();

			// set successful auth using login middleware
			cy.mockNext(200, authRedirectSignInRecentlyEmailValidated);

			const returnUrl = `https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`;

			// go to verify email endpoint
			verifyEmailFlow.goto('avalidtoken', {
				query: {
					returnUrl,
					useIdapi: 'true',
				},
			});

			// check if signed in success text exists
			cy.contains("You're signed in! Welcome to the Guardian.");

			// check if we're on the new account review page
			cy.url().should('include', '/welcome/review');

			// check return url exists
			cy.url().should('include', `returnUrl=${encodeURIComponent(returnUrl)}`);
		});

		it('verification token is expired, logged out, shows page to sign in to resend validation email', () => {
			const signInUrl = Cypress.env('SIGN_IN_PAGE_URL');
			// mock token expired
			cy.mockNext(403, validationTokenExpired);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', {
				failOnStatusCode: false,
				query: { useIdapi: 'true' },
			});

			cy.contains(VerifyEmail.CONTENT.LINK_EXPIRED);
			cy.contains(VerifyEmail.CONTENT.TOKEN_EXPIRED);

			// check sign in link
			cy.contains('a', VerifyEmail.CONTENT.SIGN_IN)
				.should('have.attr', 'href')
				.and(
					'include',
					`${signInUrl}?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/verify-email`,
					)}`,
				);
		});

		it('verification token is invalid, logged out, shows page to sign in to resend validation email', () => {
			const signInUrl = Cypress.env('SIGN_IN_PAGE_URL');
			// mock token invalid
			cy.mockNext(403, validationTokenInvalid);

			// go to verify email endpont
			verifyEmailFlow.goto('aninvalidtoken', {
				failOnStatusCode: false,
				query: { useIdapi: 'true' },
			});

			cy.contains(VerifyEmail.CONTENT.LINK_EXPIRED);
			cy.contains(VerifyEmail.CONTENT.TOKEN_EXPIRED);

			// check sign in link
			cy.contains('a', VerifyEmail.CONTENT.SIGN_IN)
				.should('have.attr', 'href')
				.and(
					'include',
					`${signInUrl}?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/verify-email`,
					)}`,
				);
		});

		it('verification token is expired, logged in, shows page to to resend validation email', () => {
			// set logged in cookies
			setAuthCookies();

			// mock token expired
			cy.mockNext(403, validationTokenExpired);

			// mock user response
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock user response again for sending validation email
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock validation email sent
			cy.mockNext(200);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', {
				failOnStatusCode: false,
				query: { useIdapi: 'true' },
			});

			cy.contains(VerifyEmail.CONTENT.VERIFY_EMAIL);
			cy.contains(VerifyEmail.CONTENT.CONFIRM_EMAIL);
			cy.contains(verifiedUserWithNoConsent.user.primaryEmailAddress);

			// click on send link button
			cy.contains(VerifyEmail.CONTENT.SEND_LINK).click();

			// expect email sent page
			cy.contains(VerifyEmail.CONTENT.EMAIL_SENT);
		});

		it('verification token is invalid, logged in, shows page to to resend validation email, and send email', () => {
			// set logged in cookies
			setAuthCookies();

			// mock token invalid
			cy.mockNext(403, validationTokenInvalid);

			// mock user response
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock user response again for sending validation email
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock validation email sent
			cy.mockNext(200);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', {
				failOnStatusCode: false,
				query: { useIdapi: 'true' },
			});

			cy.contains(VerifyEmail.CONTENT.VERIFY_EMAIL);
			cy.contains(VerifyEmail.CONTENT.CONFIRM_EMAIL);
			cy.contains(verifiedUserWithNoConsent.user.primaryEmailAddress);

			// click on send link button
			cy.contains(VerifyEmail.CONTENT.SEND_LINK).click();

			// expect email sent page
			cy.contains(VerifyEmail.CONTENT.EMAIL_SENT);
		});

		it('verification token is invalid, logged in, shows page to to resend validation email and shows recaptcha error message when reCAPTCHA token request fails', () => {
			// set logged in cookies
			setAuthCookies();

			// mock token invalid
			cy.mockNext(403, validationTokenInvalid);

			// mock user response
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock user response again for sending validation email
			cy.mockNext(200, verifiedUserWithNoConsent);

			// mock validation email sent
			cy.mockNext(200);

			// go to verify email endpont
			verifyEmailFlow.goto('expiredtoken', {
				failOnStatusCode: false,
				query: { useIdapi: 'true' },
			});

			cy.contains(VerifyEmail.CONTENT.VERIFY_EMAIL);
			cy.contains(VerifyEmail.CONTENT.CONFIRM_EMAIL);
			cy.contains(verifiedUserWithNoConsent.user.primaryEmailAddress);

			cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
				statusCode: 500,
			});

			cy.contains(VerifyEmail.CONTENT.SEND_LINK).click();
			cy.contains('Google reCAPTCHA verification failed.');
			cy.contains('If the problem persists please try the following:');
		});
	});
});
