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
