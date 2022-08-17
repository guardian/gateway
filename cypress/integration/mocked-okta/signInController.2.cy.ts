import userStatuses from '../../support/okta/userStatuses';
import ResponseFixture from '../../support/types/ResponseFixture';

beforeEach(() => {
  cy.mockPurge();
});

userStatuses.forEach((state) => {
  context(`Given I am a ${state || 'nonexistent'} user`, () => {
    context('When I submit the form on /signin', () => {
      beforeEach(() => {
        cy.visit(`/signin?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
        cy.get('input[name="password"]').type('password');
      });
      switch (state) {
        case false:
        case 'PROVISIONED':
        case 'STAGED':
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            'Then I should be shown an "Email or password incorrect" error.',
            () => {
              cy.fixture('okta-responses/error/authentication-failed').then(
                (authenticationFailedError: ResponseFixture) => {
                  cy.mockNext(
                    authenticationFailedError.code,
                    authenticationFailedError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains("Email and password don't match");
                },
              );
            },
          );
          break;
        // When I am an ACTIVE user
        case 'ACTIVE':
          specify('Then I should be signed in.', () => {
            cy.fixture('okta-responses/success/valid-user').then(
              (validUserResponse: ResponseFixture) => {
                cy.fixture('okta-responses/success/valid-user-groups').then(
                  (validUserGroupsResponse: ResponseFixture) => {
                    cy.mockNext(
                      validUserResponse.code,
                      validUserResponse.response,
                    );
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
              },
            );
          });
      }
    });
    context('When I submit the form on /reauthenticate', () => {
      beforeEach(() => {
        cy.visit(`/reauthenticate?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
        cy.get('input[name="password"]').type('password');
      });
      switch (state) {
        case false:
        case 'PROVISIONED':
        case 'STAGED':
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            'Then I should be shown an "Email or password incorrect" error.',
            () => {
              cy.fixture('okta-responses/error/authentication-failed').then(
                (authenticationFailedError: ResponseFixture) => {
                  cy.mockNext(
                    authenticationFailedError.code,
                    authenticationFailedError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains("Email and password don't match");
                },
              );
            },
          );
          break;
        // When I am an ACTIVE user
        case 'ACTIVE':
          specify('Then I should be signed in.', () => {
            cy.fixture('okta-responses/success/valid-user').then(
              (validUserResponse: ResponseFixture) => {
                cy.fixture('okta-responses/success/valid-user-groups').then(
                  (validUserGroupsResponse: ResponseFixture) => {
                    cy.mockNext(
                      validUserResponse.code,
                      validUserResponse.response,
                    );
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
              },
            );
          });
      }
    });
  });
});
