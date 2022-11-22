import authenticationFailedError from '../../fixtures/okta-responses/error/authentication-failed.json';
import validUserResponse from '../../fixtures/okta-responses/success/valid-user.json';
import validUserGroupsResponse from '../../fixtures/okta-responses/success/valid-user-groups.json';

beforeEach(() => {
  cy.mockPurge();
});
context('When I submit the form on /signin', () => {
  beforeEach(() => {
    cy.visit(`/signin`);
    cy.get('input[name="email"]').type('example@example.com');
    cy.get('input[name="password"]').type('password');
  });
  //This is expected for non existent, non active users or when the email and password are incorrect
  specify(
    'if okta authentication fails then I should be shown an "Email or password incorrect" error. ',
    () => {
      cy.mockNext(
        authenticationFailedError.code,
        authenticationFailedError.response,
      );
      cy.get('button[type=submit]').click();
      cy.contains("Email and password don't match");
    },
  );
  specify('if okta authentication succeeds then I should be signed in.', () => {
    cy.mockNext(validUserResponse.code, validUserResponse.response);
    cy.mockNext(validUserGroupsResponse.code, validUserGroupsResponse.response);

    cy.get('button[type=submit]').click();
    // we can't actually check the authorization code flow
    // so simply intercept the request and verify that it contains
    // the mocked response
    cy.intercept(
      `http://localhost:9000/oauth2/${Cypress.env(
        'OKTA_CUSTOM_OAUTH_SERVER',
      )}/v1/authorize*`,
      'OAuth',
    );
    cy.contains('OAuth');
  });
});

context('When I submit the form on /reauthenticate', () => {
  beforeEach(() => {
    cy.visit(`/reauthenticate`);
    cy.get('input[name="email"]').type('example@example.com');
    cy.get('input[name="password"]').type('password');
  });
  //This is expected for non existent, non active users or when the email and password are incorrect
  specify(
    'If okta authentication fails then I should be shown an "Email or password incorrect" error.',
    () => {
      cy.mockNext(
        authenticationFailedError.code,
        authenticationFailedError.response,
      );
      cy.get('button[type=submit]').click();
      cy.contains("Email and password don't match");
    },
  );

  specify(
    'If okta authentication succeeeds then I should be signed in.',
    () => {
      cy.mockNext(validUserResponse.code, validUserResponse.response);
      cy.mockNext(
        validUserGroupsResponse.code,
        validUserGroupsResponse.response,
      );

      cy.get('button[type=submit]').click();
      // we can't actually check the authorization code flow
      // so simply intercept the request and verify that it contains
      // the mocked response
      cy.intercept(
        `http://localhost:9000/oauth2/${Cypress.env(
          'OKTA_CUSTOM_OAUTH_SERVER',
        )}/v1/authorize*`,
        'OAuth',
      );
      cy.contains('OAuth');
    },
  );
});
