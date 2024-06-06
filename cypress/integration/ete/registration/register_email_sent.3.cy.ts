import { injectAndCheckAxe } from '../../../support/cypress-axe';
import { randomMailosaurEmail } from '../../../support/commands/testUser';

describe('Registration email sent page', () => {
	context('A11y checks', () => {
		it('has no detectable a11y violations on the registration email sent page', () => {
			cy.visit('/register/email-sent?useIdapi=true');
			injectAndCheckAxe();
		});
	});

	it('should resend "Complete Registration" email when a new user registers which is same as initial email sent', () => {
		const unregisteredEmail = randomMailosaurEmail();

		const clientId = 'jobs';
		cy.visit(`/register/email?clientId=${clientId}&useIdapi=true`);
		cy.get('input[name=email]').type(unregisteredEmail);
		const timeRequestWasMadeInitialEmail = new Date();
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your email inbox');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		// test and delete initial email
		cy.checkForEmailAndGetDetails(
			unregisteredEmail,
			timeRequestWasMadeInitialEmail,
		).then(({ body }) => {
			expect(body).to.have.string('Complete registration');
		});

		const timeRequestWasMade = new Date();
		cy.contains('send again').click();
		cy.contains('Check your email inbox');
		cy.contains(unregisteredEmail);

		// test and delete resent email
		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body }) => {
				expect(body).to.have.string('Complete registration');
				expect(body).to.have.string('clientId=' + clientId);
			},
		);
	});

	it('should resend account exists without password email when an existing user without password registers which is same as initial email sent', () => {
		cy
			.createTestUser({
				isUserEmailValidated: false,
				isGuestUser: true,
			})
			?.then(({ emailAddress }) => {
				cy.visit('/register/email?useIdapi=true');
				cy.get('input[name=email]').type(emailAddress);
				const timeRequestWasMadeInitialEmail = new Date();
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Check your email inbox');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				// test and delete initial email
				cy.checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMadeInitialEmail,
				).then(({ body }) => {
					expect(body).to.have.string('This account already exists');
					expect(body).to.have.string(
						'To continue to your account please click below to create a password.',
					);
					expect(body).to.have.string('This link is valid for 60 minutes.');
					expect(body).to.have.string('Create password');
				});

				const timeRequestWasMade = new Date();
				cy.contains('send again').click();
				cy.contains('Check your email inbox');
				cy.contains(emailAddress);

				// test and delete resent email
				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body }) => {
						expect(body).to.have.string('This account already exists');
						expect(body).to.have.string(
							'To continue to your account please click below to create a password.',
						);
						expect(body).to.have.string('This link is valid for 60 minutes.');
						expect(body).to.have.string('Create password');
					},
				);
			});
	});

	it('should resend "Account Exists" email when an existing user with password registers which is same as initial email sent', () => {
		cy
			.createTestUser({
				isUserEmailValidated: false,
			})
			?.then(({ emailAddress }) => {
				cy.visit('/register/email?useIdapi=true');
				cy.get('input[name=email]').type(emailAddress);
				const timeRequestWasMadeInitialEmail = new Date();
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Check your email inbox');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMadeInitialEmail,
				).then(({ body }) => {
					expect(body).to.have.string(
						'You are already registered with the Guardian.',
					);
				});

				const timeRequestWasMade = new Date();
				cy.contains('send again').click();
				cy.contains('Check your email inbox');
				cy.contains(emailAddress);

				// test and delete resent email
				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body }) => {
						expect(body).to.have.string(
							'You are already registered with the Guardian.',
						);
					},
				);
			});
	});

	it('should navigate back to the correct page when change email is clicked', () => {
		cy.visit('/register/email-sent?useIdapi=true');
		cy.contains('try another address').click();
		cy.contains('Register');
		cy.contains('Enter your email');
		cy.title().should('eq', 'Register With Email | The Guardian');
	});

	it('should render properly if the encrypted email cookie is not set', () => {
		cy.visit('/register/email-sent?useIdapi=true');
		cy.contains('try another address');
		cy.contains('Check your email inbox');
	});

	it('shows reCAPTCHA errors when the request fails', () => {
		cy
			.createTestUser({
				isUserEmailValidated: false,
			})
			?.then(({ emailAddress }) => {
				cy.visit('/register/email?useIdapi=true');
				cy.get('input[name=email]').type(emailAddress);

				const timeRequestWasMadeInitialEmail = new Date();

				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Check your email inbox');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMadeInitialEmail,
				);

				cy.interceptRecaptcha();

				cy.contains('send again').click();
				cy.contains('Google reCAPTCHA verification failed.');
				cy.contains('If the problem persists please try the following:');

				const timeRequestWasMade = new Date();
				cy.contains('send again').click();

				cy.contains('Google reCAPTCHA verification failed.').should(
					'not.exist',
				);

				cy.contains('Check your email inbox');
				cy.contains(emailAddress);

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);
			});
	});
});
