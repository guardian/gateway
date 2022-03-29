describe('Email template generation', () => {
  it('renders a ResetPassword email', () => {
    cy.request('/email/reset-password').then((response) => {
      expect(response.body.plain).to.contain(
        'You’ve asked us to send you a link to reset your password',
      );
      expect(response.body.html).to.contain(
        'You&#x27;ve asked us to send you a link to reset your password',
      );
    });
  });

  it('renders a Verify email', () => {
    cy.request('/email/verify').then((response) => {
      expect(response.body.plain).to.contain(
        'Please click below to complete your registration',
      );
      expect(response.body.html).to.contain(
        'Please click below to complete your registration',
      );
    });
  });

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
  it('returns a 406 error for an invalid template name', () => {
    cy.request({
      url: '/email/invalid-template',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(406);
      expect(response.body.plain).to.not.exist;
      expect(response.body.html).to.not.exist;
    });
  });
});
