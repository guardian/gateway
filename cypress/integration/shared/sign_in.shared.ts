const returnUrl =
	'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

export const linksToTheGoogleTermsOfServicePage = (isIdapi = false) => {
	return [
		'links to the Google terms of service page',
		() => {
			const googleTermsUrl = 'https://policies.google.com/terms';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', googleTermsUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('terms of service').click();
			cy.url().should('eq', googleTermsUrl);
		},
	] as const;
};

export const linksToTheGooglePrivacyPolicyPage = (isIdapi = false) => {
	return [
		'links to the Google privacy policy page',
		() => {
			const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', googlePrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('This service is protected by reCAPTCHA and the Google')
				.contains('privacy policy')
				.click();
			cy.url().should('eq', googlePrivacyPolicyUrl);
		},
	] as const;
};

export const linksToTheGuardianTermsAndConditionsPage = (isIdapi = false) => {
	return [
		'links to the Guardian terms and conditions page',
		() => {
			const guardianTermsOfServiceUrl =
				'https://www.theguardian.com/help/terms-of-service';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianTermsOfServiceUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('terms & conditions').click();
			cy.url().should('eq', guardianTermsOfServiceUrl);
		},
	] as const;
};

export const linksToTheGuardianPrivacyPolicyPage = (isIdapi = false) => {
	return [
		'links to the Guardian privacy policy page',
		() => {
			const guardianPrivacyPolicyUrl =
				'https://www.theguardian.com/help/privacy-policy';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianPrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('For information about how we use your data')
				.contains('privacy policy')
				.click();
			cy.url().should('eq', guardianPrivacyPolicyUrl);
		},
	] as const;
};

export const linksToTheGuardianJobsTermsAndConditionsPageWhenJobsClientIdSet = (
	isIdapi = false,
) => {
	return [
		'links to the Guardian jobs terms and conditions page when jobs clientId set',
		() => {
			const guardianJobsTermsOfServiceUrl =
				'https://jobs.theguardian.com/terms-and-conditions/';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianJobsTermsOfServiceUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi
				? '/signin?clientId=jobs&useIdapi=true'
				: '/signin?clientId=jobs';
			cy.visit(visitUrl);
			cy.contains('Guardian Jobs terms & conditions').click();
			cy.url().should('eq', guardianJobsTermsOfServiceUrl);
		},
	] as const;
};

export const linksToTheGuardianJobsPrivacyPolicyPageWhenJobsClientIdSet = (
	isIdapi = false,
) => {
	return [
		'links to the Guardian jobs privacy policy page when jobs clientId set',
		() => {
			const guardianJobsPrivacyPolicyUrl =
				'https://jobs.theguardian.com/privacy-policy/';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianJobsPrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			const visitUrl = isIdapi
				? '/signin?clientId=jobs&useIdapi=true'
				: '/signin?clientId=jobs';
			cy.visit(visitUrl);
			cy.contains('For information about how we use your data')
				.contains('Guardian Jobs privacy policy')
				.click();
			cy.url().should('eq', guardianJobsPrivacyPolicyUrl);
		},
	] as const;
};

export const persistsTheClientIdWhenNavigatingAway = (isIdapi = false) => {
	return [
		'persists the clientId when navigating away',
		() => {
			const visitUrl = isIdapi
				? '/signin?clientId=jobs&useIdapi=true'
				: '/signin?clientId=jobs';
			cy.visit(visitUrl);
			cy.contains('Register').click();
			cy.url().should('contain', 'clientId=jobs');
		},
	] as const;
};

export const appliesFormValidationToEmailAndPasswordInputFields = (
	isIdapi = false,
) => {
	return [
		'applies form validation to email and password input fields',
		() => {
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);

			cy.get('form').within(() => {
				cy.get('input:invalid').should('have.length', 2);
				cy.get('input[name=email]').type('not an email');
				cy.get('input:invalid').should('have.length', 2);
				cy.get('input[name=email]').type('emailaddress@inavalidformat.com');
				cy.get('input:invalid').should('have.length', 1);
				cy.get('input[name=password]').type('password');
				cy.get('input:invalid').should('have.length', 0);
			});
		},
	] as const;
};

export const showsAMessageWhenCredentialsAreInvalid = (isIdapi = false) => {
	return [
		'shows a message when credentials are invalid',
		() => {
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.get('input[name=email]').type('invalid@doesnotexist.com');
			cy.get('input[name=password]').type('password');
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.contains("Email and password don't match");
		},
	] as const;
};

export const correctlySignsInAnExistingUser = (isIdapi = false) => {
	return [
		'correctly signs in an existing user',
		() => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');
				});
		},
	] as const;
};

export const navigatesToResetPassword = (isIdapi = false) => {
	return [
		'navigates to reset password',
		() => {
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('Reset password').click();
			cy.contains('Forgot password');
		},
	] as const;
};

export const navigatesToRegistration = (isIdapi = false) => {
	return [
		'navigates to registration',
		() => {
			const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
			cy.visit(visitUrl);
			cy.contains('Register').click();
			cy.contains('Continue with Google');
			cy.contains('Continue with Apple');
			cy.contains('Continue with email');
		},
	] as const;
};

export const respectsTheReturnUrlQueryParam = (isIdapi = false) => {
	return [
		'respects the returnUrl query param',
		() => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', returnUrl, (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					const visitUrl = isIdapi
						? `/signin?returnUrl=${encodeURIComponent(returnUrl)}&useIdapi=true`
						: `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('eq', returnUrl);
				});
		},
	] as const;
};

export const redirectsCorrectlyForSocialSignIn = (isIdapi = false) => {
	return [
		'redirects correctly for social sign in',
		() => {
			const visitUrl = isIdapi
				? `/signin?returnUrl=${encodeURIComponent(returnUrl)}&useIdapi=true`
				: `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
			cy.visit(visitUrl);
			cy.get('[data-cy="google-sign-in-button"]').should(
				'have.attr',
				'href',
				`/signin/google?returnUrl=${encodeURIComponent(returnUrl)}${
					isIdapi ? '&useIdapi=true' : ''
				}`,
			);
			cy.get('[data-cy="apple-sign-in-button"]').should(
				'have.attr',
				'href',
				`/signin/apple?returnUrl=${encodeURIComponent(returnUrl)}${
					isIdapi ? '&useIdapi=true' : ''
				}`,
			);
		},
	] as const;
};

export const removesEncryptedEmailParameterFromQueryString = (
	isIdapi = false,
) => {
	return [
		'removes encryptedEmail parameter from query string',
		() => {
			const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
			const visitUrl = isIdapi
				? `/signin?${encryptedEmailParam}&useIdapi=true`
				: `/signin?${encryptedEmailParam}`;
			cy.visit(visitUrl);

			cy.location('search').should('not.contain', encryptedEmailParam);
		},
	] as const;
};

export const removesEncryptedEmailParameterAndPreservesAllOtherValidParameters =
	(isIdapi = false) => {
		return [
			'removes encryptedEmail parameter and preserves all other valid parameters',
			() => {
				const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
				const visitUrl = isIdapi
					? `/signin?returnUrl=${encodeURIComponent(
							returnUrl,
						)}&${encryptedEmailParam}&refViewId=12345&useIdapi=true`
					: `/signin?returnUrl=${encodeURIComponent(
							returnUrl,
						)}&${encryptedEmailParam}&refViewId=12345`;
				cy.visit(visitUrl);

				cy.location('search').should('not.contain', encryptedEmailParam);
				cy.location('search').should('contain', 'refViewId=12345');
				cy.location('search').should('contain', encodeURIComponent(returnUrl));
			},
		] as const;
	};

export const hitsAccessTokenRateLimitAndRecoversTokenAfterTimeout = (
	isIdapi = false,
) => {
	return [
		'hits access token rate limit and recovers token after timeout',
		() => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');

					// We visit reauthenticate here because if we visit /signin or
					// /register, the logged in user guard will redirect us away before
					// the ratelimiter has a chance to work
					const reauthUrl = isIdapi
						? '/reauthenticate?useIdapi=true'
						: '/reauthenticate';
					cy.visit(reauthUrl);
					cy.contains('Sign');
					Cypress._.times(6, () => cy.reload());
					cy.contains('Rate limit exceeded');
				});
		},
	] as const;
};

export const showsAnErrorMessageAndInformationParagraphWhenAccountLinkingRequiredErrorParameterIsPresent =
	(isIdapi = false) => {
		return [
			'shows an error message and information paragraph when accountLinkingRequired error parameter is present',
			() => {
				const visitUrl = isIdapi
					? '/signin?error=accountLinkingRequired&useIdapi=true'
					: '/signin?error=accountLinkingRequired';
				cy.visit(visitUrl);
				cy.contains(
					'We could not sign you in with your social account credentials. Please sign in with your email below.',
				);
				cy.contains('Social sign-in unsuccessful');
			},
		] as const;
	};

export const doesNotDisplaySocialButtonsWhenAccountLinkingRequiredErrorParameterIsPresent =
	(isIdapi = false) => {
		return [
			'does not display social buttons when accountLinkingRequired error parameter is present',
			() => {
				const visitUrl = isIdapi
					? '/signin?error=accountLinkingRequired&useIdapi=true'
					: '/signin?error=accountLinkingRequired';
				cy.visit(visitUrl);
				cy.get('[data-cy="google-sign-in-button"]').should('not.exist');
				cy.get('[data-cy="apple-sign-in-button"]').should('not.exist');
			},
		] as const;
	};

export const showsRecaptchaErrorsWhenTheUserTriesToSignInOfflineAndAllowsSignInWhenBackOnline =
	(isIdapi = false) => {
		return [
			'shows reCAPTCHA errors when the user tries to sign in offline and allows sign in when back online',
			() => {
				// Intercept the external redirect page.
				// We just want to check that the redirect happens, not that the page loads.
				cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
					req.reply(200);
				});
				cy
					.createTestUser({
						isUserEmailValidated: true,
					})
					?.then(({ emailAddress, finalPassword }) => {
						const visitUrl = isIdapi ? '/signin?useIdapi=true' : '/signin';
						cy.visit(visitUrl);

						cy.interceptRecaptcha();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('input[name=password]').type(finalPassword);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Google reCAPTCHA verification failed.');
						cy.contains('If the problem persists please try the following:');

						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Google reCAPTCHA verification failed.').should(
							'not.exist',
						);

						cy.url().should('include', 'https://m.code.dev-theguardian.com/');
					});
			},
		] as const;
	};
