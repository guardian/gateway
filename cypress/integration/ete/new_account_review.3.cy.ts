import { JOBS_TOS_URI } from '../../../src/shared/model/Configuration';
import { randomMailosaurEmail } from '../../support/commands/testUser';

describe('New account newsletters page', () => {
	beforeEach(() => {
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/**', (req) => {
			req.reply(200);
		});
	});
	['GB', 'FR', 'AU', 'US'].forEach((geoLocation) => {
		it(`should redirect to the newsletters page if the geolocation is ${geoLocation}`, () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.setCookie('cypress-mock-state', geoLocation);

			cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your one-time code');
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
					cy.url().should('include', '/passcode');
					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					cy.url().should('contain', '/welcome/review');
					cy.get('a').contains('Continue').click();
					cy.contains(
						'Our newsletters help you get closer to our quality, independent journalism.',
					);
					cy.get('button[type="submit"]').click();
					cy.url().should('contain', decodeURIComponent(encodedReturnUrl));
				},
			);
		});
	});

	it('should redirect to the Jobs T&C page if client is Jobs', () => {
		cy.intercept('GET', 'https://jobs.theguardian.com/', (req) => {
			req.reply(200);
		});

		const encodedReturnUrl =
			'https%3A%2F%2Fjobs.theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}&clientId=jobs`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your one-time code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ id, body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/passcode');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				// jobs T&C page
				cy.url().should('contain', JOBS_TOS_URI);
				cy.contains(
					'Click ‘continue’ to automatically use your existing Guardian account to sign in with Guardian Jobs',
				);

				cy.get('input[name=firstName]').type(id);
				cy.get('input[name=secondName]').type(id);
				cy.get('button[type="submit"]').click();

				// jobs.theguardian.com
				cy.url().should('include', 'https://jobs.theguardian.com/');
			},
		);
	});
});
