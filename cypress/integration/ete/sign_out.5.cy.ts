describe('Sign out flow', () => {
	const DotComCookies = [
		'gu_user_features_expiry',
		'gu_user_benefits_expiry',
		'gu_paying_member',
		'gu_recurring_contributor',
		'gu_digital_subscriber',
	];
	context('Signs a user out', () => {
		it('Removes Okta cookies and dotcom cookies when signing out', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					// load the new account review page as it's on the same domain
					const postSignInReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/welcome/review`;
					const visitUrl = `/signin?returnUrl=${encodeURIComponent(
						postSignInReturnUrl,
					)}&usePasswordSignIn=true`;
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					// check sign in has worked first
					cy.url().should('include', `/welcome/review`);
					// check session cookie is set
					cy.getCookie('idx').should('exist');
					// check idapi cookies are set
					cy.getCookie('SC_GU_U').should('exist');
					cy.getCookie('SC_GU_LA').should('exist');
					cy.getCookie('GU_U').should('exist');

					// Dotcom cookies might have been set on the base domain
					DotComCookies.forEach((cookie) => {
						cy.setCookie(cookie, `the_${cookie}_cookie`, {
							domain: Cypress.env('BASE_URI')?.replace('profile', ''),
						});
					});

					// attempt to sign out and redirect to sign in to make sure the cookies are removed
					// and the signed in as page isn't visible
					const postSignOutReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/signin`;
					cy.visit(
						`/signout?returnUrl=${encodeURIComponent(postSignOutReturnUrl)}`,
					);

					// check cookies are removed
					cy.getCookie('sid').should('not.exist');
					cy.getCookie('idx').should('not.exist');
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
