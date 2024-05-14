import { setMvtId } from '../../support/commands/setMvtId';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { GEOLOCATION_CODES } from '../../support/geolocation';
import NewslettersPage from '../../support/pages/onboarding/newsletters_page';
import ReviewPage from '../../support/pages/onboarding/review_page';
import YourDataPage from '../../support/pages/onboarding/your_data_page';

describe('Onboarding flow', () => {
	beforeEach(() => {
		// Intercept the external redirect page.
		// We just want to check that the redirect happens, not that the page loads.
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
			req.reply(200);
		});
		setMvtId('0');
	});

	context('Full flow', () => {
		it('goes through the full flow, opt in all consents/marketing, preserve returnUrl', () => {
			// Intercept the geolocation header and set it to GB to show Saturday Edition.
			cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
				// eslint-disable-next-line functional/immutable-data
				req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
			});

			const returnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.enableCMP();
			cy.visit(`/register?returnUrl=${returnUrl}`);
			cy.acceptCMP();
			cy.contains('Continue with email').click();

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				cy.setCookie('cypress-mock-state', 'FR');

				cy.visit(`/welcome/${token}`);

				cy.contains('Save and continue');

				cy.get('input[name=password]').type(randomPassword());

				cy.get('[data-cy="change-password-button"]').click();

				cy.url().should('include', NewslettersPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				NewslettersPage.backButton().should('not.exist');

				NewslettersPage.allCheckboxes().should('not.be.checked');
				NewslettersPage.allCheckboxes().click({
					multiple: true,
					timeout: 8000,
				});

				NewslettersPage.saveAndContinueButton().click();

				cy.url().should('include', YourDataPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				YourDataPage.backButton()
					.should('have.attr', 'href')
					.and('include', NewslettersPage.URL);

				YourDataPage.personalisedAdvertisingOptInInput().should(
					'not.be.checked',
				);

				YourDataPage.personalisedAdvertisingOptInSwitch().click();
				YourDataPage.marketingOptInSwitch().should('be.checked');
				YourDataPage.personalisedAdvertisingOptInInput().should('be.checked');

				YourDataPage.saveAndContinueButton().click();

				cy.url().should('include', ReviewPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				ReviewPage.backButton().should('not.exist');
				ReviewPage.saveAndContinueButton().should('not.exist');

				// contains opted in newsletters
				// TODO: this sometimes fails on CODE when the newsletters api is not up to date, temporarily disabling while we find a better way of reliably testing this
				// cy.contains('Down to Earth');
				// cy.contains('The Long Read');
				// cy.contains('First Edition');

				// contains consents
				cy.contains(ReviewPage.CONTENT.SUPPORTING_THE_GUARDIAN_CONSENT);
				cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT);
				cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT);

				// does not contain messaging encouraging user to consider other newsletters
				// TODO: this sometimes fails on CODE when the newsletters api is not up to date, temporarily disabling while we find a better way of reliably testing this
				// cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should(
				// 	'not.exist',
				// );

				ReviewPage.returnButton()
					.should('have.attr', 'href')
					.and('include', decodeURIComponent(returnUrl));

				cy.getCookie('cypress-consent-response')
					.should('exist')
					.should('have.property', 'value')
					.should(
						'contain',
						'similar_guardian_products%22%2C%22consented%22%3Atrue',
					);

				cy.getCookie('cypress-newsletter-response')
					.should('exist')
					.should('have.property', 'value')
					.should('contain', '6031%22%2C%22subscribed%22%3Atrue');

				ReviewPage.returnButton().click();

				cy.url().should('include', decodeURIComponent(returnUrl));
			});
		});

		it('goes through full fow, opt out of all consents/newsletters, preserve returnUrl', () => {
			// Intercept the geolocation header and set it to GB to show Saturday Edition.
			cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
				// eslint-disable-next-line functional/immutable-data
				req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
			});
			const returnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(`/register?returnUrl=${returnUrl}`);

			cy.contains('Continue with email').click();
			// opt out of newsletter
			cy.contains('Saturday Edition').click();
			// opt out of supporter consent
			cy.contains('Toggle to opt out.').click();

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				cy.enableCMP();
				cy.setCookie('cypress-mock-state', 'FR');

				cy.visit(`/welcome/${token}`);
				cy.acceptCMP();

				cy.contains('Save and continue');

				cy.get('input[name=password]').type(randomPassword());

				cy.get('[data-cy="change-password-button"]').click();

				cy.url().should('include', NewslettersPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				NewslettersPage.backButton().should('not.exist');

				NewslettersPage.allCheckboxes().should('not.be.checked');

				NewslettersPage.saveAndContinueButton().click();

				cy.url().should('include', YourDataPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				YourDataPage.backButton()
					.should('have.attr', 'href')
					.and('include', NewslettersPage.URL);

				YourDataPage.personalisedAdvertisingOptInInput().should(
					'not.be.checked',
				);
				YourDataPage.marketingOptInSwitch().should('be.checked');

				YourDataPage.marketingOptInSwitch().click({ force: true });

				YourDataPage.marketingOptInSwitch().should('not.be.checked');
				YourDataPage.personalisedAdvertisingOptInInput().should(
					'not.be.checked',
				);

				YourDataPage.saveAndContinueButton().click();

				cy.url().should('include', ReviewPage.URL);
				cy.url().should('include', `returnUrl=${returnUrl}`);

				ReviewPage.backButton().should('not.exist');
				ReviewPage.saveAndContinueButton().should('not.exist');

				// contains opted in newsletters
				cy.contains('Down to Earth').should('not.exist');
				cy.contains('The Long Read').should('not.exist');
				cy.contains('First Edition').should('not.exist');

				// contains consents
				cy.contains(ReviewPage.CONTENT.SUPPORTING_THE_GUARDIAN_CONSENT).should(
					'not.exist',
				);
				cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT).should('not.exist');
				cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT).should(
					'not.exist',
				);

				// contains messaging encouraging user to consider other newsletters
				cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should('exist');

				ReviewPage.returnButton()
					.should('have.attr', 'href')
					.and('include', decodeURIComponent(returnUrl));

				cy.getCookie('cypress-consent-response').should('not.exist');

				cy.getCookie('cypress-newsletter-response').should('not.exist');

				ReviewPage.returnButton().click();

				cy.url().should('include', decodeURIComponent(returnUrl));
			});
		});
	});
});

// this uses a workaround specific test case for new social user registrations in Okta
// In Okta new social registered users are added to the GuardianUser-EmailValidated group
// by default, but the custom emailValidated field is not defined/set to false
// this causes problems in legacy code, where the emailValidated flag is not set but the group is
// so we need to set the flag to true when the user is added to the group
// we do this on the oauth callback route /oauth/authorization-code/callback
// where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy
// we can also use this point to do anything else for social registrations, e.g. show the consents page
// These tests checks this behaviour by first getting a user into this state
// i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated
describe('Social Registration - Consents Page', () => {
	it('shows the consents page for social registration using google - opts in', () => {
		// Intercept the geolocation header and set it to GB to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
		});
		// first we have to get the id of the GuardianUser-EmailValidated group
		cy.findEmailValidatedOktaGroupId().then((groupId) => {
			// next we create a test user
			cy.createTestUser({}).then(({ emailAddress, finalPassword }) => {
				// we get the user profile object from Okta
				cy.getTestOktaUser(emailAddress).then((user) => {
					const { id, profile } = user;
					// check the user profile has the emailValidated flag set to false
					expect(profile.emailValidated).to.be.false;
					// next check the user groups
					cy.getOktaUserGroups(id).then((groups) => {
						// make sure the user is not in the GuardianUser-EmailValidated group
						const group = groups.find((g) => g.id === groupId);
						expect(group).not.to.exist;

						// and add them to the group if this is the case
						cy.addOktaUserToGroup(id, groupId);

						// at this point the user is in the correct state
						// so we attempt to sign them in, which mocks the behaviour of a user
						// signing in/registering with social
						cy.visit(
							`/signin?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/consents`,
							)}`,
						);
						cy.setCookie('cypress-mock-state', 'google');
						cy.get('input[name=email]').type(emailAddress);
						cy.get('input[name=password]').type(finalPassword);
						cy.get('[data-cy="main-form-submit-button"]').click();
						cy.url().should('include', '/welcome/google');

						// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
						cy.getTestOktaUser(id).then((user) => {
							const { profile } = user;
							expect(profile.emailValidated).to.be.true;
						});

						// and the user should also be in the group
						cy.getOktaUserGroups(id).then((groups) => {
							const group = groups.find((g) => g.id === groupId);
							expect(group).to.exist;
						});

						// finally we check the consents is saved by going through onboarding
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.url().should('include', NewslettersPage.URL);

						NewslettersPage.saveAndContinueButton().click();

						cy.url().should('include', YourDataPage.URL);

						YourDataPage.saveAndContinueButton().click();

						cy.url().should('include', ReviewPage.URL);

						cy.contains(ReviewPage.CONTENT.SUPPORTING_THE_GUARDIAN_CONSENT);

						cy.getCookie('cypress-consent-response')
							.should('exist')
							.should('have.property', 'value')
							.should(
								'contain',
								'similar_guardian_products%22%2C%22consented%22%3Atrue',
							);

						cy.getCookie('cypress-newsletter-response')
							.should('exist')
							.should('have.property', 'value')
							.should('contain', '6031%22%2C%22subscribed%22%3Atrue');
					});
				});
			});
		});
	});

	it('shows the consents page for social registration using apple - opts out', () => {
		// Intercept the geolocation header and set it to GB to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
		});
		// first we have to get the id of the GuardianUser-EmailValidated group
		cy.findEmailValidatedOktaGroupId().then((groupId) => {
			// next we create a test user
			cy.createTestUser({}).then(({ emailAddress, finalPassword }) => {
				// we get the user profile object from Okta
				cy.getTestOktaUser(emailAddress).then((user) => {
					const { id, profile } = user;
					// check the user profile has the emailValidated flag set to false
					expect(profile.emailValidated).to.be.false;
					// next check the user groups
					cy.getOktaUserGroups(id).then((groups) => {
						// make sure the user is not in the GuardianUser-EmailValidated group
						const group = groups.find((g) => g.id === groupId);
						expect(group).not.to.exist;

						// and add them to the group if this is the case
						cy.addOktaUserToGroup(id, groupId);

						// at this point the user is in the correct state
						// so we attempt to sign them in, which mocks the behaviour of a user
						// signing in/registering with social
						cy.visit(
							`/signin?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/consents`,
							)}`,
						);
						cy.setCookie('cypress-mock-state', 'apple');
						cy.get('input[name=email]').type(emailAddress);
						cy.get('input[name=password]').type(finalPassword);
						cy.get('[data-cy="main-form-submit-button"]').click();
						cy.url().should('include', '/welcome/apple');

						// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
						cy.getTestOktaUser(id).then((user) => {
							const { profile } = user;
							expect(profile.emailValidated).to.be.true;
						});

						// and the user should also be in the group
						cy.getOktaUserGroups(id).then((groups) => {
							const group = groups.find((g) => g.id === groupId);
							expect(group).to.exist;
						});

						// opt out of newsletter
						cy.contains('Saturday Edition').click();
						// opt out of supporter consent
						cy.contains('Toggle to opt out.').click();

						// finally we check the consents is saved by going through onboarding
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.url().should('include', NewslettersPage.URL);

						NewslettersPage.saveAndContinueButton().click();

						cy.url().should('include', YourDataPage.URL);

						YourDataPage.saveAndContinueButton().click();

						cy.url().should('include', ReviewPage.URL);

						cy.contains(
							ReviewPage.CONTENT.SUPPORTING_THE_GUARDIAN_CONSENT,
						).should('not.exist');

						cy.getCookie('cypress-consent-response').should('not.exist');

						cy.getCookie('cypress-newsletter-response').should('not.exist');
					});
				});
			});
		});
	});
});
