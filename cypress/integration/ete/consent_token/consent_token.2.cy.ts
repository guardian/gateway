describe('Consent token flow', () => {
	it('shows the success page when supplied a valid token by a logged in user', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);
			// SC_GU_LA is required for the cy.getTestUserDetails
			const scGuLa = cookies.find((cookie) => cookie.key === 'SC_GU_LA');
			if (!scGuLa) throw new Error('SC_GU_LA cookie not found');
			cy.setCookie('SC_GU_LA', scGuLa?.value);
			cy.sendConsentEmail({
				emailAddress,
				consents: ['jobs'],
			}).then(() => {
				const timeRequestWasMade = new Date();
				cy.checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMade,
					/consent-token\/([^"]*)/,
				).then(({ token }) => {
					cy.visit(`/consent-token/${token}/accept`, {
						failOnStatusCode: false,
					});
					cy.contains('Subscribe Confirmation');
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
