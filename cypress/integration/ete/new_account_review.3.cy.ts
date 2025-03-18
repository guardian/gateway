import { Consents } from '../../../src/shared/model/Consent';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('New account review page', () => {
	beforeEach(() => {
		// Intercept the external redirect page.
		// We just want to check that the redirect happens, not that the page loads.
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/**', (req) => {
			req.reply(200);
		});
	});
	it('should show the profiling and personalised advertising checkboxes for new users', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		// Set the country cookie so we can check that it's set correctly on the user
		cy.setCookie('cypress-mock-state', 'GB');

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				cy.contains('Complete creating account');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();

				cy.url().should('contain', '/welcome/review');

				// Always shown
				cy.get('label').contains(
					'Allow the Guardian to analyse my signed-in data to improve marketing content',
				);
				cy.contains('What we mean by signed-in data');

				cy.get('label').contains(
					'Allow personalised advertising with my signed-in data',
				);
				cy.contains('Advertising is a crucial source of our funding');

				// Flip the switches so personalised advertising is on
				// and profiling is off
				cy.get(`label#${Consents.ADVERTISING}_description`).click();
				cy.get(`label#${Consents.PROFILING}_description`).click();
				cy.get('button[type="submit"]').click();

				cy.url().should('contain', decodeURIComponent(encodedReturnUrl));

				// Return to Gateway so we can access the user cookie
				cy.visit('/signin?usePasswordSignIn=true');
				cy.getTestOktaUser(unregisteredEmail).then((user) => {
					cy.getTestUserDetails(user.profile.legacyIdentityId).then(
						(response) => {
							const consentIds = response.user.consents.filter(
								(consent) =>
									consent.id === 'profiling_optout' ||
									consent.id === 'personalised_advertising',
							);
							expect(consentIds).to.have.length(2);
							response.user.consents.map((consent) => {
								if (consent.id === 'profiling_optout') {
									// Profiling is modelled as an optout so we now expect it to be true
									expect(consent.consented).to.be.true;
								}
								if (consent.id === 'personalised_advertising') {
									expect(consent.consented).to.be.true;
								}
							});
						},
					);
					expect(user.profile.registrationLocation).to.equal('United Kingdom');
				});
			},
		);
	});
});

describe('New account newsletters page', () => {
	beforeEach(() => {
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/**', (req) => {
			req.reply(200);
		});
	});
	it('should not redirect to the newsletters page if the geolocation is UK/EU', () => {
		// We test that the GB geolocation flow works as expected in the tests above
		// because they set the geolocation mock cookie to GB, and don't expect a redirect
		// to the newsletters page, so here we just check an EU geolocation.
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.setCookie('cypress-mock-state', 'FR');

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				cy.contains('Complete creating account');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();

				cy.url().should('contain', '/welcome/review');
				cy.get('button[type="submit"]').click();
				cy.contains(
					'Our newsletters help you get closer to our quality, independent journalism.',
				).should('not.exist');
				cy.url().should('contain', decodeURIComponent(encodedReturnUrl));
			},
		);
	});

	it('should redirect to the newsletters page if the geolocation is AU', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.setCookie('cypress-mock-state', 'AU');

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				cy.contains('Complete creating account');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();

				cy.url().should('contain', '/welcome/review');
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', '/welcome/newsletters');
				cy.contains(
					'Our newsletters help you get closer to our quality, independent journalism.',
				);
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', decodeURIComponent(encodedReturnUrl));
			},
		);
	});

	it('should redirect to the newsletters page if the geolocation is US', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.setCookie('cypress-mock-state', 'US');

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				cy.contains('Complete creating account');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();

				cy.url().should('contain', '/welcome/review');
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', '/welcome/newsletters');
				cy.contains(
					'Our newsletters help you get closer to our quality, independent journalism.',
				);
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', decodeURIComponent(encodedReturnUrl));
			},
		);
	});
});
