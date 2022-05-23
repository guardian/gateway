import { stringify } from 'query-string';

const returnUrl =
  'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
const defaultReturnUrl = 'https://m.code.dev-theguardian.com';

export const beforeEach = () => {
  // Disable redirect to /signin/success by default
  cy.setCookie(
    'GU_ran_experiments',
    stringify({ OptInPromptPostSignIn: Date.now() }),
  );
};

export const linksToTheGoogleTermsOfServicePage = (isOkta = false) => {
  return [
    'links to the Google terms of service page',
    () => {
      const googleTermsUrl = 'https://policies.google.com/terms';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googleTermsUrl, (req) => {
        req.reply(200);
      });
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('terms of service').click();
      cy.url().should('eq', googleTermsUrl);
    },
  ] as const;
};

export const linksToTheGooglePrivacyPolicyPage = (isOkta = false) => {
  return [
    'links to the Google privacy policy page',
    () => {
      const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googlePrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('This site is protected by reCAPTCHA and the Google')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', googlePrivacyPolicyUrl);
    },
  ] as const;
};

export const linksToTheGuardianTermsAndConditionsPage = (isOkta = false) => {
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
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('terms & conditions').click();
      cy.url().should('eq', guardianTermsOfServiceUrl);
    },
  ] as const;
};

export const linksToTheGuardianPrivacyPolicyPage = (isOkta = false) => {
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
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('For information about how we use your data')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', guardianPrivacyPolicyUrl);
    },
  ] as const;
};

export const linksToTheGuardianJobsTermsAndConditionsPageWhenJobsClientIdSet = (
  isOkta = false,
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
      const visitUrl = isOkta
        ? '/signin?clientId=jobs&useOkta=true'
        : '/signin?clientId=jobs';
      cy.visit(visitUrl);
      cy.contains("Guardian's Jobs terms & conditions").click();
      cy.url().should('eq', guardianJobsTermsOfServiceUrl);
    },
  ] as const;
};

export const linksToTheGuardianJobsPrivacyPolicyPageWhenJobsClientIdSet = (
  isOkta = false,
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
      const visitUrl = isOkta
        ? '/signin?clientId=jobs&useOkta=true'
        : '/signin?clientId=jobs';
      cy.visit(visitUrl);
      cy.contains('For information about how we use your data')
        .contains("Guardian Jobs' privacy policy")
        .click();
      cy.url().should('eq', guardianJobsPrivacyPolicyUrl);
    },
  ] as const;
};

export const persistsTheClientIdWhenNavigatingAway = (isOkta = false) => {
  return [
    'persists the clientId when navigating away',
    () => {
      const visitUrl = isOkta
        ? '/signin?clientId=jobs&useOkta=true'
        : '/signin?clientId=jobs';
      cy.visit(visitUrl);
      cy.contains('Register').click();
      cy.url().should('contain', 'clientId=jobs');
    },
  ] as const;
};

export const appliesFormValidationToEmailAndPasswordInputFields = (
  isOkta = false,
) => {
  return [
    'applies form validation to email and password input fields',
    () => {
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
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

export const showsAMessageWhenCredentialsAreInvalid = (isOkta = false) => {
  return [
    'shows a message when credentials are invalid',
    () => {
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.get('input[name=email]').type('invalid@doesnotexist.com');
      cy.get('input[name=password]').type('password');
      cy.get('[data-cy="sign-in-button"]').click();
      cy.contains("Email and password don't match");
    },
  ] as const;
};

export const correctlySignsInAnExistingUser = (isOkta = false) => {
  return [
    'correctly signs in an existing user',
    () => {
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
        req.reply(200);
      });
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
    },
  ] as const;
};

export const navigatesToResetPassword = (isOkta = false) => {
  return [
    'navigates to reset password',
    () => {
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('Reset password').click();
      cy.contains('Forgot password');
    },
  ] as const;
};

export const navigatesToRegistration = (isOkta = false) => {
  return [
    'navigates to registration',
    () => {
      const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
      cy.visit(visitUrl);
      cy.contains('Register').click();
      cy.get('[data-cy="register-button"]').should('be.visible');
    },
  ] as const;
};

export const respectsTheReturnUrlQueryParam = (isOkta = false) => {
  return [
    'respects the returnUrl query param',
    () => {
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', returnUrl, (req) => {
        req.reply(200);
      });
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = isOkta
          ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}&useOkta=true`
          : `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('eq', returnUrl);
      });
    },
  ] as const;
};

export const redirectsCorrectlyForSocialSignIn = (isOkta = false) => {
  return [
    'redirects correctly for social sign in',
    () => {
      const visitUrl = isOkta
        ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}&useOkta=true`
        : `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
      cy.visit(visitUrl);
      cy.get('[data-cy="google-sign-in-button"]').should(
        'have.attr',
        'href',
        `/signin/google?returnUrl=${encodeURIComponent(returnUrl)}${
          isOkta ? '&useOkta=true' : ''
        }`,
      );
      cy.get('[data-cy="facebook-sign-in-button"]').should(
        'have.attr',
        'href',
        `/signin/facebook?returnUrl=${encodeURIComponent(returnUrl)}${
          isOkta ? '&useOkta=true' : ''
        }`,
      );
      cy.get('[data-cy="apple-sign-in-button"]').should(
        'have.attr',
        'href',
        `/signin/apple?returnUrl=${encodeURIComponent(returnUrl)}${
          isOkta ? '&useOkta=true' : ''
        }`,
      );
    },
  ] as const;
};

export const removesEncryptedEmailParameterFromQueryString = (
  isOkta = false,
) => {
  return [
    'removes encryptedEmail parameter from query string',
    () => {
      const visitUrl = isOkta
        ? '/signin?encryptedEmail=bhvlabgflbgyil&useOkta=true'
        : '/signin?encryptedEmail=bhvlabgflbgyil';
      cy.visit(visitUrl);

      const finalUrl = isOkta
        ? `?returnUrl=${encodeURIComponent(defaultReturnUrl)}&useOkta=true`
        : `?returnUrl=${encodeURIComponent(defaultReturnUrl)}`;
      cy.location('search').should('eq', finalUrl);
    },
  ] as const;
};

export const removesEncryptedEmailParameterAndPreservesAllOtherValidParameters =
  (isOkta = false) => {
    return [
      'removes encryptedEmail parameter and preserves all other valid parameters',
      () => {
        const visitUrl = isOkta
          ? `/signin?returnUrl=${encodeURIComponent(
              returnUrl,
            )}&encryptedEmail=bdfalrbagbgu&refViewId=12345&useOkta=true`
          : `/signin?returnUrl=${encodeURIComponent(
              returnUrl,
            )}&encryptedEmail=bdfalrbagbgu&refViewId=12345`;
        cy.visit(visitUrl);

        // We add a '/' to the Okta assertion because at some point in the oauth flow it is added to the returnUrl.
        // This is because `url.pathname` in validateUrl.ts (validateReturnUrl) returns '/'
        const finalUrl = isOkta
          ? `?refViewId=12345&returnUrl=${encodeURIComponent(
              returnUrl,
            )}&useOkta=true`
          : `?refViewId=12345&returnUrl=${encodeURIComponent(returnUrl)}`;
        cy.location('search').should('eq', finalUrl);
      },
    ] as const;
  };

export const hitsAccessTokenRateLimitAndRecoversTokenAfterTimeout = (
  isOkta = false,
) => {
  return [
    'hits access token rate limit and recovers token after timeout',
    () => {
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
        req.reply(200);
      });
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');

        cy.visit('/signin');
        cy.contains('Sign');
        Cypress._.times(6, () => cy.reload());
        cy.contains('Rate limit exceeded');
      });
    },
  ] as const;
};

export const showsAnErrorMessageAndInformationParagraphWhenAccountLinkingRequiredErrorParameterIsPresent =
  (isOkta = false) => {
    return [
      'shows an error message and information paragraph when accountLinkingRequired error parameter is present',
      () => {
        const visitUrl = isOkta
          ? '/signin?error=accountLinkingRequired&useOkta=true'
          : '/signin?error=accountLinkingRequired';
        cy.visit(visitUrl);
        cy.contains(
          'We cannot sign you in with your social account credentials. Please enter your account password below to sign in.',
        );
        cy.get('[class*=ErrorSummary]').contains('Account already exists');
      },
    ] as const;
  };

export const doesNotDisplaySocialButtonsWhenAccountLinkingRequiredErrorParameterIsPresent =
  (isOkta = false) => {
    return [
      'does not display social buttons when accountLinkingRequired error parameter is present',
      () => {
        const visitUrl = isOkta
          ? '/signin?error=accountLinkingRequired&useOkta=true'
          : '/signin?error=accountLinkingRequired';
        cy.visit(visitUrl);
        cy.get('[data-cy="google-sign-in-button"]').should('not.exist');
        cy.get('[data-cy="facebook-sign-in-button"]').should('not.exist');
        cy.get('[data-cy="apple-sign-in-button"]').should('not.exist');
      },
    ] as const;
  };

export const showsRecaptchaErrorsWhenTheUserTriesToSignInOfflineAndAllowsSignInWhenBackOnline =
  (isOkta = false) => {
    return [
      'shows reCAPTCHA errors when the user tries to sign in offline and allows sign in when back online',
      () => {
        // Intercept the external redirect page.
        // We just want to check that the redirect happens, not that the page loads.
        cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
          req.reply(200);
        });
        cy.createTestUser({
          isUserEmailValidated: true,
        })?.then(({ emailAddress, finalPassword }) => {
          const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
          cy.visit(visitUrl);

          // Simulate going offline by failing to reCAPTCHA POST request.
          cy.intercept({
            method: 'POST',
            url: 'https://www.google.com/recaptcha/api2/**',
            times: 1,
          });

          cy.get('input[name=email]').type(emailAddress);
          cy.get('input[name=password]').type(finalPassword);
          cy.get('[data-cy="sign-in-button"]').click();
          cy.contains(
            'Google reCAPTCHA verification failed. Please try again.',
          );

          // On second click, an expanded error is shown.
          cy.get('[data-cy="sign-in-button"]').click();

          cy.contains('Google reCAPTCHA verification failed.');
          cy.contains('Report this error').should(
            'have.attr',
            'href',
            'https://manage.theguardian.com/help-centre/contact-us',
          );
          cy.contains('If the problem persists please try the following:');

          cy.get('[data-cy="sign-in-button"]').click();

          cy.contains(
            'Google reCAPTCHA verification failed. Please try again.',
          ).should('not.exist');

          cy.url().should('include', 'https://m.code.dev-theguardian.com/');
        });
      },
    ] as const;
  };

export const redirectsToOptInPrompt = (isOkta = false) => {
  return [
    'redirects user to prompt if they are not a supporter',
    () => {
      // Intercept the prompt page
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', '/signin/success*', (req) => {
        req.reply(200);
      });
      // Enable the opt in prompt "experiment"
      cy.clearCookie('GU_ran_experiments');
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = isOkta ? '/signin?useOkta=true' : '/signin';
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should(
          'include',
          `/signin/success?returnUrl=${encodeURIComponent(
            'https://m.code.dev-theguardian.com/',
          )}`,
        );
      });
    },
  ] as const;
};
