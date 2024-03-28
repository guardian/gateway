describe('Sign out flow', () => {
	const DotComCookies = [
		'gu_user_features_expiry',
		'gu_paying_member',
		'gu_recurring_contributor',
		'gu_digital_subscriber',
	];

	context('Signs a user out', () => {
		it('Removes IDAPI log in cookies and dotcom cookies when signing out', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					// load the consents page as its on the same domain
					const postSignInReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/welcome/review?useIdapi=true`;
					const visitUrl = `/signin?returnUrl=${encodeURIComponent(
						postSignInReturnUrl,
					)}&useIdapi=true`;
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);

					DotComCookies.forEach((cookie) => {
						cy.setCookie(cookie, `the_${cookie}_cookie`, {
							domain: Cypress.env('BASE_URI')?.replace('profile', ''),
						});
					});

					cy.get('[data-cy="main-form-submit-button"]').click();

					// check sign in has worked first
					cy.url().should('include', `/welcome/review`);
					// check cookies are set
					cy.getCookie('SC_GU_U').should('exist');
					cy.getCookie('SC_GU_LA').should('exist');
					cy.getCookie('GU_U').should('exist');
					DotComCookies.forEach((cookie) => {
						cy.getCookie(cookie).should('exist');
					});

					// attempt to sign out and redirect to reset password as it's on same domain
					const postSignOutReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/reset-password`;
					cy.visit(
						`/signout?returnUrl=${encodeURIComponent(
							postSignOutReturnUrl,
						)}&useIdapi=true`,
					);
					// check cookies are removed
					cy.getCookie('SC_GU_U').should('not.exist');
					cy.getCookie('SC_GU_LA').should('not.exist');
					cy.getCookie('GU_U').should('not.exist');
					DotComCookies.forEach((cookie) => {
						cy.getCookie(cookie).should('not.exist');
					});
				});
		});
	});
});
