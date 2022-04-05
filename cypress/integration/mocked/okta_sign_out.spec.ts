describe('Sign out flow', () => {
  context('Signs a user out', () => {
    beforeEach(() => {
      cy.mockPurge();
    });
    // TODO: move to ete okta test as the mocked sid cookie cannot be cleared as it's not a hostOnly cookie
    it.skip('Removes Okta cookies and dotcom cookies when signing out', () => {
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
          mfaActive: true,
        },
        '/api/v1/sessions/the_sid_cookie',
      );

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      cy.mockPattern(200, {}, '/unauth');

      cy.setCookie('sid', `the_sid_cookie`);

      //visit the register page to set the cookie on the correct domain (localhost)
      cy.visit('/register');
      //
      cy.getCookie('sid').should('exist');

      cy.request('/signout').then(() => {
        cy.getCookie('sid').should('not.exist');
      });
    });
  });
});
