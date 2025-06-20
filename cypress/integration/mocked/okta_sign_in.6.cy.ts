describe('Sign in flow', () => {
	context('Signing in - Okta', () => {
		beforeEach(() => {
			cy.mockPurge();
		});

		it('loads the "signed in as" page if user is already authenticated', function () {
			cy.mockPattern(
				200,
				{
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
				'/api/v1/sessions/me',
			);

			cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

			cy.setCookie('idx', `the_idx_cookie`);

			cy.visit('/signin');

			cy.contains('Sign in to the Guardian');
			cy.contains('You are signed in with');
			cy.contains('user@example.com');
			cy.contains('Continue')
				.should('have.attr', 'href')
				.and('include', '/signin/refresh')
				.and('include', 'returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com');
			cy.contains('a', 'Sign in')
				.should('have.attr', 'href')
				.and(
					'include',
					'/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FreturnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com',
				);
			cy.contains('Sign in with a different email');
		});

		it('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - live app', function () {
			cy.mockPattern(
				200,
				{
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
				'/api/v1/sessions/me',
			);

			cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

			cy.mockPattern(
				200,
				{
					id: '123',
					label: 'ios_live_app',
					settings: {
						oauthClient: {
							redirect_uris: [],
						},
					},
				},
				'/api/v1/apps/123',
			);

			cy.setCookie('idx', `the_idx_cookie`);

			cy.visit(
				'/signin?appClientId=123&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			cy.contains('Sign in to the Guardian app');
			cy.contains('You are signed in with');
			cy.contains('user@example.com');
			cy.contains('Continue')
				.should('have.attr', 'href')
				.and('include', '/oauth2/v1/authorize/redirect?okta_key=oktaKey');
			cy.contains('a', 'Sign in')
				.should('have.attr', 'href')
				.and(
					'include',
					'/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D123%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com',
				);
			cy.contains('Sign in with a different email');
		});

		it('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - feast app ios', function () {
			cy.mockPattern(
				200,
				{
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
				'/api/v1/sessions/me',
			);

			cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

			cy.mockPattern(
				200,
				{
					id: '456',
					label: 'ios_feast_app',
					settings: {
						oauthClient: {
							redirect_uris: [],
						},
					},
				},
				'/api/v1/apps/456',
			);

			cy.setCookie('idx', `the_idx_cookie`);

			cy.visit(
				'/signin?appClientId=456&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			cy.contains('Sign in to the Feast app');
			cy.contains('You are signed in with');
			cy.contains('user@example.com');
			cy.contains('Continue')
				.should('have.attr', 'href')
				.and('include', '/oauth2/v1/authorize/redirect?okta_key=oktaKey');
			cy.contains('a', 'Sign in')
				.should('have.attr', 'href')
				.and(
					'include',
					'/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D456%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com',
				);
			cy.contains('Sign in with a different email');
		});

		it('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - feast app android', function () {
			cy.mockPattern(
				200,
				{
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
				'/api/v1/sessions/me',
			);

			cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

			cy.mockPattern(
				200,
				{
					id: '456',
					label: 'android_feast_app',
					settings: {
						oauthClient: {
							redirect_uris: [],
						},
					},
				},
				'/api/v1/apps/456',
			);

			cy.setCookie('idx', `the_idx_cookie`);

			cy.visit(
				'/signin?appClientId=456&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			cy.contains('Sign in to the Feast app');
			cy.contains('You are signed in with');
			cy.contains('user@example.com');
			cy.contains('Continue')
				.should('have.attr', 'href')
				.and('include', '/oauth2/v1/authorize/redirect?okta_key=oktaKey');
			cy.contains('a', 'Sign in')
				.should('have.attr', 'href')
				.and(
					'include',
					'/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D456%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com',
				);
			cy.contains('Sign in with a different email');
		});

		it.only('loads the "signed in as" page if user is already authenticated and coming from jobs and oauth flow', function () {
			cy.mockPattern(
				200,
				{
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
				'/api/v1/sessions/me',
			);

			cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

			cy.mockPattern(
				200,
				{
					id: 'jobs',
					label: 'jobs',
					settings: {
						oauthClient: {
							redirect_uris: [],
						},
					},
				},
				'/api/v1/apps/456',
			);

			cy.setCookie('idx', `the_idx_cookie`);

			cy.visit(
				'/signin?clientId=jobs&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			cy.contains('Sign in with the Guardian');
			cy.contains('You are signed in with');
			cy.contains('user@example.com');
			cy.contains('If this is your first time using Guardian Jobs');

			cy.contains('Continue')
				.should('have.attr', 'href')
				.and(
					'include',
					`fromURI=${encodeURIComponent(`/oauth2/v1/authorize/redirect?okta_key=oktaKey`)}`,
				)
				.and('include', '/agree/GRS');

			cy.contains('a', 'Sign in')
				.should('have.attr', 'href')
				.and(
					'include',
					'/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FclientId%253Djobs%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com',
				);
			cy.contains('Sign in with a different email');
		});

		it('shows an error message when okta authentication fails - useOktaClassic', function () {
			cy.visit('/signin?useOktaClassic=true');
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(401, {
				errorCode: 'E0000004',
				errorSummary: 'errorSummary',
				errorLink: '',
				errorId: 'errorId',
				errorCauses: [],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Email and password don’t match');
		});

		it('shows a generic error message when okta rate limited - useOktaClassic', function () {
			cy.visit('/signin?useOktaClassic=true');
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(429, {
				errorCode: 'E0000047',
				errorSummary: 'errorSummary',
				errorLink: '',
				errorId: 'errorId',
				errorCauses: [],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem signing in, please try again.');
		});

		it('shows a generic error message when okta api response unknown - useOktaClassic', function () {
			cy.visit('/signin?useOktaClassic=true');
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(403, {
				errorCode: 'E0000147',
				errorSummary: 'errorSummary',
				errorLink: '',
				errorId: 'errorId',
				errorCauses: [],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem signing in, please try again.');
		});

		it('loads the redirectUrl upon successful authentication for validated user - useOktaClassic', function () {
			cy.visit(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useOktaClassic=true',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(200, {
				expiresAt: '3000-01-01T00:00:00.000Z',
				status: 'SUCCESS',
				sessionToken: 'some-session-token',
				_embedded: {
					user: {
						id: 'okta-id',
						passwordChanged: '2020-01-01T00:00:00.000Z',
						profile: {
							login: 'test.man@example.com',
							firstName: 'Test',
							lastName: 'Man',
							locale: 'en_GB',
							timeZone: 'Europe/London',
						},
					},
				},
			});

			cy.mockNext(200, [
				{
					id: '123',
					profile: {
						name: 'GuardianUser-EmailValidated',
						description: 'User has validated their email',
					},
				},
			]);

			// we can't actually check the authorization code flow
			// so intercept the request and redirect to the guardian about page
			cy.intercept(
				`http://localhost:9000/oauth2/${Cypress.env(
					'OKTA_CUSTOM_OAUTH_SERVER',
				)}/v1/authorize*`,
				(req) => {
					req.redirect('https://www.theguardian.com/about');
				},
			).as('authRedirect');

			cy.get('[data-cy=main-form-submit-button]').click();
			cy.wait('@authRedirect').then(() => {
				cy.url().should('include', 'https://www.theguardian.com/about');
			});
		});

		it('redirects to the default url if no redirectUrl given - useOktaClassic', function () {
			cy.visit('/signin?useOktaClassic=true');
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(200, {
				expiresAt: '3000-01-01T00:00:00.000Z',
				status: 'SUCCESS',
				sessionToken: 'some-session-token',
				_embedded: {
					user: {
						id: 'okta-id',
						passwordChanged: '2020-01-01T00:00:00.000Z',
						profile: {
							login: 'test.man@example.com',
							firstName: 'Test',
							lastName: 'Man',
							locale: 'en_GB',
							timeZone: 'Europe/London',
						},
					},
				},
			});

			cy.mockNext(200, [
				{
					id: '123',
					profile: {
						name: 'GuardianUser-EmailValidated',
						description: 'User has validated their email',
					},
				},
			]);

			// we can't actually check the authorization code flow
			// so intercept the request and redirect to the default return URL
			cy.intercept(
				`http://localhost:9000/oauth2/${Cypress.env(
					'OKTA_CUSTOM_OAUTH_SERVER',
				)}/v1/authorize*`,
				(req) => {
					req.redirect('https://m.code.dev-theguardian.com/');
				},
			).as('authRedirect');

			cy.get('[data-cy=main-form-submit-button]').click();
			cy.wait('@authRedirect').then(() => {
				cy.url().should('include', 'https://m.code.dev-theguardian.com/');
			});
		});
	});
});
