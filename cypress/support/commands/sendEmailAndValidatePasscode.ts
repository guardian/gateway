/**
 * @jest-environment jsdom
 */

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			sendEmailAndValidatePasscode: typeof sendEmailAndValidatePasscode;
		}
	}
}

/**
 * Send an email, receive the passcode and validate it on the sign in page
 * @param emailAddress The email address you want the passcode to be sent to
 * @param expectedReturnUrl  The url you are returned to after signing in
 * @param params URL params added to the sign in url
 * @param expectedEmailBody  What do you want the email body copy to say
 * @param additionalTests  Additional tests/checks that you might want to chek for as well as signining in
 * @returns A chainable cypress command.
 */
export const sendEmailAndValidatePasscode = ({
	emailAddress,
	expectedReturnUrl = 'https://m.code.dev-theguardian.com/',
	params,
	expectedEmailBody = 'Your one-time passcode',
	additionalTests,
}: {
	emailAddress: string;
	expectedReturnUrl?: string;
	params?: string;
	expectedEmailBody?: 'Your one-time passcode' | 'Your verification code';
	additionalTests?: 'passcode-incorrect' | 'resend-email' | 'change-email';
}) => {
	cy.setCookie('cypress-mock-state', '1'); // passcode send again timer
	cy.visit(`/signin?${params ? `${params}` : ''}`);
	cy.get('input[name=email]').clear().type(emailAddress);

	const timeRequestWasMade = new Date();
	cy.get('[data-cy="main-form-submit-button"]').click();

	return cy
		.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade)
		.then(({ body, codes }) => {
			// email
			expect(body).to.have.string(expectedEmailBody);
			expect(codes?.length).to.eq(1);
			const code = codes?.[0].value;
			expect(code).to.match(/^\d{6}$/);

			// passcode page
			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');

			switch (additionalTests) {
				case 'resend-email':
					{
						const timeRequestWasMade2 = new Date();
						cy.wait(1000); // wait for the send again button to be enabled
						cy.contains('send again').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade2,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string(expectedEmailBody);
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							cy.contains('Sign in');
							cy.get('input[name=code]').type(code!);

							cy.url().should('include', expectedReturnUrl);

							cy.getTestOktaUser(emailAddress).then((user) => {
								expect(user.status).to.eq('ACTIVE');
								expect(user.profile.emailValidated).to.eq(true);
							});
						});
					}
					break;
				case 'change-email':
					cy.contains('try another address').click();

					cy.url().should('include', '/signin');
					break;
				case 'passcode-incorrect':
					cy.contains('Enter your one-time code');
					cy.get('input[name=code]').type(`${+code! + 1}`);

					cy.url().should('include', '/signin/code');

					cy.contains('Incorrect code');
					cy.get('input[name=code]').clear().type(code!);

					cy.contains('Submit verification code').click();

					cy.url().should('include', expectedReturnUrl);

					cy.getTestOktaUser(emailAddress).then((user) => {
						expect(user.status).to.eq('ACTIVE');
						expect(user.profile.emailValidated).to.eq(true);
					});
					break;
				default: {
					cy.contains('Enter your one-time code');
					cy.get('input[name=code]').type(code!);

					cy.url().should('include', 'welcome/existing');

					cy.contains('a', 'Return to the Guardian').click();
					cy.url().should('include', expectedReturnUrl);

					cy.getTestOktaUser(emailAddress).then((user) => {
						expect(user.status).to.eq('ACTIVE');
						expect(user.profile.emailValidated).to.eq(true);
					});
				}
			}
		});
};
