const oauthBaseUrl = 'https://oauth.code.dev-theguardian.com';
describe('Sign in flow', () => {
  const returnUrl =
    'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
  const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
  context('Terms and Conditions links', () => {
    it('links to the Google terms of service page', () => {
      const googleTermsUrl = 'https://policies.google.com/terms';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googleTermsUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('terms of service').click();
      cy.url().should('eq', googleTermsUrl);
    });

    it('links to the Google privacy policy page', () => {
      const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googlePrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('This site is protected by reCAPTCHA and the Google')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', googlePrivacyPolicyUrl);
    });

    it('links to the Guardian terms and conditions page', () => {
      const guardianTermsOfServiceUrl =
        'https://www.theguardian.com/help/terms-of-service';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', guardianTermsOfServiceUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('terms & conditions').click();
      cy.url().should('eq', guardianTermsOfServiceUrl);
    });

    it('links to the Guardian privacy policy page', () => {
      const guardianPrivacyPolicyUrl =
        'https://www.theguardian.com/help/privacy-policy';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', guardianPrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('For information about how we use your data')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', guardianPrivacyPolicyUrl);
    });

    it('links to the Guardian jobs terms and conditions page when jobs clientId set', () => {
      const guardianJobsTermsOfServiceUrl =
        'https://jobs.theguardian.com/terms-and-conditions/';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', guardianJobsTermsOfServiceUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin?clientId=jobs');
      cy.contains("Guardian's Jobs terms & conditions").click();
      cy.url().should('eq', guardianJobsTermsOfServiceUrl);
    });

    it('links to the Guardian jobs privacy policy page when jobs clientId set', () => {
      const guardianJobsPrivacyPolicyUrl =
        'https://jobs.theguardian.com/privacy-policy/';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', guardianJobsPrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin?clientId=jobs');
      cy.contains('For information about how we use your data')
        .contains("Guardian Jobs' privacy policy")
        .click();
      cy.url().should('eq', guardianJobsPrivacyPolicyUrl);
    });
  });
  it('persists the clientId when navigating away', () => {
    cy.visit('/signin?clientId=jobs');
    cy.contains('Register').click();
    cy.url().should('contain', 'clientId=jobs');
  });
  it('applies form validation to email and password input fields', () => {
    cy.visit('/signin');

    cy.get('form').within(() => {
      cy.get('input:invalid').should('have.length', 2);
      cy.get('input[name=email]').type('not an email');
      cy.get('input:invalid').should('have.length', 2);
      cy.get('input[name=email]').type('emailaddress@inavalidformat.com');
      cy.get('input:invalid').should('have.length', 1);
      cy.get('input[name=password]').type('password');
      cy.get('input:invalid').should('have.length', 0);
    });
  });
  it('shows a message when credentials are invalid', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type('invalid@doesnotexist.com');
    cy.get('input[name=password]').type('password');
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains('Email and password don’t match');
  });

  it('correctly signs in an existing user', () => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
      req.reply(200);
    });
    cy.createTestUser({
      isUserEmailValidated: true,
    })?.then(({ emailAddress, finalPassword }) => {
      cy.visit('/signin');
      cy.get('input[name=email]').type(emailAddress);
      cy.get('input[name=password]').type(finalPassword);
      cy.get('[data-cy="sign-in-button"]').click();
      cy.url().should('include', 'https://m.code.dev-theguardian.com/');
    });
  });

  it('navigates to reset password', () => {
    cy.visit('/signin');
    cy.contains('Reset password').click();
    cy.contains('Forgot password');
  });

  it('navigates to registration', () => {
    cy.visit('/signin');
    cy.contains('Register').click();
    cy.get('[data-cy="register-button"]').should('be.visible');
  });

  it('respects the returnUrl query param', () => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', returnUrl, (req) => {
      req.reply(200);
    });
    cy.createTestUser({
      isUserEmailValidated: true,
    })?.then(({ emailAddress, finalPassword }) => {
      cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      cy.get('input[name=email]').type(emailAddress);
      cy.get('input[name=password]').type(finalPassword);
      cy.get('[data-cy="sign-in-button"]').click();
      cy.url().should('eq', returnUrl);
    });
  });

  it('redirects correctly for social sign in', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('[data-cy="google-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/google/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="facebook-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/facebook/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="apple-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/apple/signin?returnUrl=${encodeURIComponent(returnUrl)}`,
    );
  });
  it('removes encryptedEmail parameter from query string', () => {
    cy.visit(`/signin?encryptedEmail=bhvlabgflbgyil`);
    cy.location('search').should(
      'eq',
      `?returnUrl=${encodeURIComponent(defaultReturnUrl)}`,
    );
  });
  it('removes encryptedEmail parameter and preserves all other valid parameters', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}&encryptedEmail=bdfalrbagbgu&refViewId=12345`,
    );
    cy.location('search').should(
      'eq',
      `?refViewId=12345&returnUrl=${encodeURIComponent(returnUrl)}`,
    );
  });
  it('shows an error message and information paragraph when accountLinkingRequired error parameter is present', () => {
    cy.visit(`/signin?error=accountLinkingRequired`);
    cy.contains(
      'We cannot sign you in with your social account credentials. Please enter your account password below to sign in.',
    );
    cy.get('[class*=ErrorSummary]').contains('Account already exists');
  });
  it('does not display social buttons when accountLinkingRequired error parameter is present', () => {
    cy.visit(`/signin?error=accountLinkingRequired`);
    cy.get('[data-cy="google-sign-in-button"]').should('not.exist');
    cy.get('[data-cy="facebook-sign-in-button"]').should('not.exist');
    cy.get('[data-cy="apple-sign-in-button"]').should('not.exist');
  });

  it('shows reCAPTCHA errors when the user tries to sign in offline and allows sign in when back online', () => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
      req.reply(200);
    });
    cy.createTestUser({
      isUserEmailValidated: true,
    })?.then(({ emailAddress, finalPassword }) => {
      cy.visit(`/signin`);

      // Simulate going offline by failing to reCAPTCHA POST request.
      cy.intercept({
        method: 'POST',
        url: 'https://www.google.com/recaptcha/api2/**',
        times: 1,
      });

      cy.get('input[name=email]').type(emailAddress);
      cy.get('input[name=password]').type(finalPassword);
      cy.get('[data-cy="sign-in-button"]').click();
      cy.contains('Google reCAPTCHA verification failed. Please try again.');

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
  });
});
