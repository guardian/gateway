describe('Consent token flow', () => {
	it('shows the success page when supplied a valid token by a logged in user', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress }) => {
			cy.sendConsentEmail({
				emailAddress,
				consents: ['jobs'],
			}).then(() => {
				const timeRequestWasMade = new Date();
				cy.checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMade,
					/consent-token\/([^"]*)\//,
				).then(({ token }) => {
					// the token has the /accept suffix already appended to it
					cy.visit(`/consent-token/${token}/accept`, {
						failOnStatusCode: false,
					});
					cy.contains("You're signed up!");
					// TODO: Would be nice to check that the user is actually
					// subscribed to the newsletters here
					cy.url().should('include', '/subscribe/success');
				});
			});
		});
	});

	it('shows the email sent page when supplied an invalid token', () => {
		const invalidToken = 'invalid-consent-token';
		cy.visit(`/consent-token/${invalidToken}/accept`);
		cy.contains('This link has expired.');
		cy.get('button[type=submit]').click();
		cy.url().should('include', '/consent-token/email-sent');
		cy.contains('Check your inbox');
	});
});
