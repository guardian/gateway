describe('Reauthenticate flow, Okta enabled, password default', () => {
	it('keeps User A signed in when User A attempts to reauthenticate', () => {
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress, finalPassword }) => {
				// First, sign in
				cy.visit(
					`/signin?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}&usePasswordSignIn=true`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Then, try to reauthenticate
				cy.visit(
					`/reauthenticate?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}&usePasswordSignIn=true`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Get the current session data
				cy.getCookie('idx').then((idxCookie) => {
					const idx = idxCookie?.value;
					expect(idx).to.exist;
					if (idx) {
						cy.getCurrentOktaSession({ idx }).then((session) => {
							expect(session.login).to.equal(emailAddress);
						});
					}
				});
			},
		);
	});
	it('signs in User B when User B attempts to reauthenticate while User A is logged in', () => {
		// Create User A
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress: emailAddressA, finalPassword: finalPasswordA }) => {
				// First, sign in as User A
				cy.visit(
					`/signin?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}&usePasswordSignIn=true`,
				);
				cy.get('input[name=email]').type(emailAddressA);
				cy.get('input[name=password]').type(finalPasswordA);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Create User B
				cy.createTestUser({ isUserEmailValidated: true })?.then(
					({ emailAddress: emailAddressB, finalPassword: finalPasswordB }) => {
						// Then, try to reauthenticate as User B
						cy.visit(
							`/reauthenticate?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}&usePasswordSignIn=true`,
						);
						cy.get('input[name=email]').type(emailAddressB);
						cy.get('input[name=password]').type(finalPasswordB);
						cy.get('[data-cy="main-form-submit-button"]').click();
						cy.url().should('include', '/welcome/review');

						// Get the current session data
						cy.getCookie('idx').then((idxCookie) => {
							const idx = idxCookie?.value;
							expect(idx).to.exist;
							if (idx) {
								cy.getCurrentOktaSession({ idx }).then((session) => {
									expect(session.login).to.equal(emailAddressB);
								});
							}
						});
					},
				);
			},
		);
	});
});

describe('Reauthenticate flow, Okta enabled, passcode default', () => {
	it('keeps User A signed in when User A attempts to reauthenticate - with password', () => {
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress, finalPassword }) => {
				// First, sign in
				cy.visit(
					`/signin/password?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Then, try to reauthenticate
				cy.visit(
					`/reauthenticate?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.contains('Sign in with a password instead').click();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Get the current session data
				cy.getCookie('idx').then((idxCookie) => {
					const idx = idxCookie?.value;
					expect(idx).to.exist;
					if (idx) {
						cy.getCurrentOktaSession({ idx }).then((session) => {
							expect(session.login).to.equal(emailAddress);
						});
					}
				});
			},
		);
	});

	it('keeps User A signed in when User A attempts to reauthenticate - with passcode', () => {
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress, finalPassword }) => {
				// First, sign in
				cy.visit(
					`/signin/password?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Then, try to reauthenticate
				cy.visit(
					`/reauthenticate?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.get('input[name=email]').type(emailAddress);
				const timeRequestWasMade = new Date();
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ codes }) => {
						// email
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/signin/code');
						cy.contains('Enter your one-time code');
						cy.contains('Sign in');
						cy.get('input[name=code]').type(code!);

						cy.url().should('include', '/welcome/review');

						// Get the current session data
						cy.getCookie('idx').then((idxCookie) => {
							const idx = idxCookie?.value;
							expect(idx).to.exist;
							if (idx) {
								cy.getCurrentOktaSession({ idx }).then((session) => {
									expect(session.login).to.equal(emailAddress);
								});
							}
						});
					},
				);
			},
		);
	});

	it('signs in User B when User B attempts to reauthenticate while User A is logged in - with password', () => {
		// Create User A
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress: emailAddressA, finalPassword: finalPasswordA }) => {
				// First, sign in as User A
				cy.visit(
					`/signin/password?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.get('input[name=email]').type(emailAddressA);
				cy.get('input[name=password]').type(finalPasswordA);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Create User B
				cy.createTestUser({ isUserEmailValidated: true })?.then(
					({ emailAddress: emailAddressB, finalPassword: finalPasswordB }) => {
						// Then, try to reauthenticate as User B
						cy.visit(
							`/reauthenticate?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}`,
						);
						cy.contains('Sign in with a password instead').click();
						cy.get('input[name=email]').type(emailAddressB);
						cy.get('input[name=password]').type(finalPasswordB);
						cy.get('[data-cy="main-form-submit-button"]').click();
						cy.url().should('include', '/welcome/review');

						// Get the current session data
						cy.getCookie('idx').then((idxCookie) => {
							const idx = idxCookie?.value;
							expect(idx).to.exist;
							if (idx) {
								cy.getCurrentOktaSession({ idx }).then((session) => {
									expect(session.login).to.equal(emailAddressB);
								});
							}
						});
					},
				);
			},
		);
	});

	it('signs in User B when User B attempts to reauthenticate while User A is logged in - with passcode', () => {
		// Create User A
		cy.createTestUser({ isUserEmailValidated: true })?.then(
			({ emailAddress: emailAddressA, finalPassword: finalPasswordA }) => {
				// First, sign in as User A
				cy.visit(
					`/signin/password?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/review`,
					)}`,
				);
				cy.get('input[name=email]').type(emailAddressA);
				cy.get('input[name=password]').type(finalPasswordA);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/review');

				// Create User B
				cy.createTestUser({ isUserEmailValidated: true })?.then(
					({ emailAddress: emailAddressB }) => {
						// Then, try to reauthenticate as User B
						cy.visit(
							`/reauthenticate?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}`,
						);
						cy.get('input[name=email]').type(emailAddressB);
						const timeRequestWasMade = new Date();
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddressB,
							timeRequestWasMade,
						).then(({ codes }) => {
							// email
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/signin/code');
							cy.contains('Enter your one-time code');
							cy.contains('Sign in');
							cy.get('input[name=code]').type(code!);

							cy.url().should('include', '/welcome/review');

							// Get the current session data
							cy.getCookie('idx').then((idxCookie) => {
								const idx = idxCookie?.value;
								expect(idx).to.exist;
								if (idx) {
									cy.getCurrentOktaSession({ idx }).then((session) => {
										expect(session.login).to.equal(emailAddressB);
									});
								}
							});
						});
					},
				);
			},
		);
	});
});
