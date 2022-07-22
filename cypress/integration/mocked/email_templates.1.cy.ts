describe('Email template generation', () => {
  it('renders an accidental email', () => {
    cy.request('/email/accidental-email').then((response) => {
      expect(response.body.plain).to.contain(
        'This email has been triggered accidentally.',
      );
      expect(response.body.html).to.contain(
        'This email has been triggered accidentally.',
      );
    });
  });
  it('renders an account exists email', () => {
    cy.request('/email/account-exists').then((response) => {
      expect(response.body.plain).to.contain(
        'You are already registered with the Guardian',
      );
      expect(response.body.html).to.contain(
        'You are already registered with the Guardian',
      );
    });
  });

  it('renders an account without password exists email', () => {
    cy.request('/email/account-without-password-exists').then((response) => {
      expect(response.body.plain).to.contain(
        'You are already registered with the Guardian',
      );
      expect(response.body.html).to.contain(
        'You are already registered with the Guardian',
      );
    });
  });

  it('renders a create password email', () => {
    cy.request('/email/create-password').then((response) => {
      expect(response.body.plain).to.contain(
        'Please click below to create a password for your account',
      );
      expect(response.body.html).to.contain(
        'Please click below to create a password for your account',
      );
    });
  });

  it('renders a no account email', () => {
    cy.request('/email/no-account').then((response) => {
      expect(response.body.plain).to.contain(
        "It's quick and easy to create an account and we won't ask you for personal details.",
      );
      expect(response.body.html).to.contain(
        'It&#x27;s quick and easy to create an account and we won&#x27;t ask you for personal details',
      );
    });
  });

  it('renders a reset password email', () => {
    cy.request('/email/reset-password').then((response) => {
      expect(response.body.plain).to.contain(
        'You’ve asked us to send you a link to reset your password',
      );
      expect(response.body.html).to.contain(
        'You&#x27;ve asked us to send you a link to reset your password',
      );
    });
  });

  it('renders a verify email', () => {
    cy.request('/email/verify').then((response) => {
      expect(response.body.plain).to.contain(
        'Please click below to complete your registration',
      );
      expect(response.body.html).to.contain(
        'Please click below to complete your registration',
      );
    });
  });

  it('returns a 404 error for an invalid template name', () => {
    cy.request({
      url: '/email/invalid-template',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body.plain).to.not.exist;
      expect(response.body.html).to.not.exist;
    });
  });
});
