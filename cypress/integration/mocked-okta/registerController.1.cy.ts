import userStatuses from '../../support/okta/userStatuses';
import ResponseFixture from '../../support/types/ResponseFixture';

beforeEach(() => {
  cy.mockPurge();
});

userStatuses.forEach((status) => {
  context(`Given I am a ${status || 'nonexistent'} user`, () => {
    context('When I submit the form on /register', () => {
      beforeEach(() => {
        cy.visit(`/register?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  // Set the correct user status on the response
                  const response = { ...userResponse.response, status };
                  cy.mockNext(userResponse.code, response);
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-exists').then(
                (userExistsError: ResponseFixture) => {
                  cy.fixture('okta-responses/success/user').then(
                    (userResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(
                        userExistsError.code,
                        userExistsError.response,
                      );
                      cy.mockNext(userResponse.code, response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
        case 'STAGED':
          // Then Gateway should generate an activation token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-exists').then(
                (userExistsError: ResponseFixture) => {
                  cy.fixture('okta-responses/success/user').then(
                    (userResponse: ResponseFixture) => {
                      cy.fixture('okta-responses/success/token').then(
                        (tokenResponse: ResponseFixture) => {
                          // Set the correct user status on the response
                          const response = { ...userResponse.response, status };
                          cy.mockNext(
                            userExistsError.code,
                            userExistsError.response,
                          );
                          cy.mockNext(userResponse.code, response);
                          cy.mockNext(
                            tokenResponse.code,
                            tokenResponse.response,
                          );
                          cy.get('button[type=submit]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                        },
                      );
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          // Then Gateway should generate a reset password token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-exists').then(
                (userExistsError: ResponseFixture) => {
                  cy.fixture('okta-responses/success/user').then(
                    (userResponse: ResponseFixture) => {
                      cy.fixture('okta-responses/success/reset-password').then(
                        (tokenResponse: ResponseFixture) => {
                          // Set the correct user status on the response
                          const response = { ...userResponse.response, status };
                          cy.mockNext(
                            userExistsError.code,
                            userExistsError.response,
                          );
                          cy.mockNext(userResponse.code, response);
                          cy.mockNext(
                            tokenResponse.code,
                            tokenResponse.response,
                          );
                          cy.get('button[type=submit]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                        },
                      );
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
  });
});
