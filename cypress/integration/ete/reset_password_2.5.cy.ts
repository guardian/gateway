import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

const breachCheck = () => {
	cy.intercept({
		method: 'GET',
		url: 'https://api.pwnedpasswords.com/range/*',
	}).as('breachCheck');
};

describe('Password reset recovery flows', () => {
	context(
		'Passcode limbo state - user does not set password after using passcode',
		() => {
			it('allows the user to recover from the STAGED state when going through reset password flow', () => {
				breachCheck();

				const emailAddress = randomMailosaurEmail();
				cy.visit(`/register/email`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your code');
				cy.contains(emailAddress);

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your verification code');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/register/email-sent');
						cy.get('input[name=code]').type(code!);

						cy.contains('Submit verification code').click();

						// password page
						cy.url().should('include', '/welcome/password');

						// user now in limbo state where they have not set a password
						// recover by going through reset password flow
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').clear().type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.get('input[name=code]').clear().type(code!);
							cy.contains('Submit one-time code').click();

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					},
				);
			});

			it('allows the user to recover from the PROVISIONED state when going through reset password flow', () => {
				breachCheck();

				const emailAddress = randomMailosaurEmail();
				cy.visit(`/register/email`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your code');
				cy.contains(emailAddress);

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your verification code');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/register/email-sent');
						cy.get('input[name=code]').type(code!);

						cy.contains('Submit verification code').click();

						// password page
						cy.url().should('include', '/welcome/password');

						// transition user to PROVISIONED state
						cy.activateTestOktaUser(emailAddress).then(() => {
							// user now in limbo state where they have not set a password
							// recover by going through reset password flow
							cy.visit('/reset-password');

							const timeRequestWasMade = new Date();
							cy.get('input[name=email]').clear().type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
							).then(({ body, codes }) => {
								// email
								expect(body).to.have.string('Your one-time passcode');
								expect(codes?.length).to.eq(1);
								const code = codes?.[0].value;
								expect(code).to.match(/^\d{6}$/);

								// passcode page
								cy.url().should('include', '/reset-password/email-sent');
								cy.contains('Enter your one-time code');

								cy.get('input[name=code]').clear().type(code!);
								cy.contains('Submit one-time code').click();

								// password page
								cy.url().should('include', '/reset-password/password');

								cy.get('input[name="password"]').type(randomPassword());
								cy.get('button[type="submit"]').click();

								// password complete page
								cy.url().should('include', '/reset-password/complete');

								cy.contains('Password updated');
							});
						});
					},
				);
			});
		},
	);
});
