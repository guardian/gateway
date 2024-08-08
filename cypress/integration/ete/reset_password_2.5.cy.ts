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

						cy.contains('Check your inbox');
						cy.contains(emailAddress);

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/\/set-password\/([^"]*)/,
						).then(({ links, body }) => {
							expect(body).to.have.string('Welcome back');

							expect(body).to.have.string('Create password');
							expect(links.length).to.eq(2);
							const setPasswordLink = links.find((s) =>
								s.text?.includes('Create password'),
							);

							cy.visit(setPasswordLink?.href as string);
							cy.contains('Create password');
							cy.contains(emailAddress);

							cy.get('input[name=password]').type(randomPassword());

							cy.wait('@breachCheck');
							cy.get('[data-cy="main-form-submit-button"]')
								.click()
								.should('be.disabled');
							cy.contains('Password created');
							cy.contains(emailAddress.toLowerCase());
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

							cy.contains('Check your inbox');
							cy.contains(emailAddress);

							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
								/\/set-password\/([^"]*)/,
							).then(({ links, body }) => {
								expect(body).to.have.string('Welcome back');

								expect(body).to.have.string('Create password');
								expect(links.length).to.eq(2);
								const setPasswordLink = links.find((s) =>
									s.text?.includes('Create password'),
								);

								cy.visit(setPasswordLink?.href as string);
								cy.contains('Create password');
								cy.contains(emailAddress);

								cy.get('input[name=password]').type(randomPassword());

								cy.wait('@breachCheck');
								cy.get('[data-cy="main-form-submit-button"]')
									.click()
									.should('be.disabled');
								cy.contains('Password created');
								cy.contains(emailAddress.toLowerCase());
							});
						});
					},
				);
			});
		},
	);
});
