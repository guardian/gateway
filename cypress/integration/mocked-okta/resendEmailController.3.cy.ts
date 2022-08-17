import userStatuses from '../../support/okta/userStatuses';
import ResponseFixture from '../../support/types/ResponseFixture';

beforeEach(() => {
  cy.mockPurge();
});

userStatuses.forEach((status) => {
  context(`Given I am a ${status || 'nonexistent'} user`, () => {
    context('When I submit the form on /register/email-sent', () => {
      beforeEach(() => {
        // We mock the encrypted state cookie here to trick the endpoint
        // into thinking we've just gone through the preceeding flow.
        // For readEncryptedStateCookie to succeed, it relies on a testing
        // env variable to be set, otherwise it won't be able to read the cookie.
        cy.setEncryptedStateCookie({
          email: 'example@example.com',
          status: String(status),
        });
        cy.visit(`/register/email-sent?useOkta=true`);
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
                  cy.get('[data-cy="main-form-submit-button"]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
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
                      cy.get('[data-cy="main-form-submit-button"]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
    context('When I submit the form on /welcome/email-sent', () => {
      beforeEach(() => {
        // We mock the encrypted state cookie here to trick the endpoint
        // into thinking we've just gone through the preceeding flow.
        // For readEncryptedStateCookie to succeed, it relies on a testing
        // env variable to be set, otherwise it won't be able to read the cookie.
        cy.setEncryptedStateCookie({
          email: 'example@example.com',
          status: String(status),
        });
        cy.visit(`/welcome/email-sent?useOkta=true`);
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
                  cy.get('[data-cy="main-form-submit-button"]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
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
                      cy.get('[data-cy="main-form-submit-button"]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
    context('When I submit the form on /welcome/resend', () => {
      beforeEach(() => {
        cy.visit(`/welcome/resend?useOkta=true`);
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
                  cy.get('[data-cy="main-form-submit-button"]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
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
                      cy.get('[data-cy="main-form-submit-button"]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
    context('When I submit the form on /welcome/expired', () => {
      beforeEach(() => {
        cy.visit(`/welcome/expired?useOkta=true`);
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
                  cy.get('[data-cy="main-form-submit-button"]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
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
                      cy.get('[data-cy="main-form-submit-button"]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
                          cy.get('[data-cy="main-form-submit-button"]').click();
                          cy.contains('Check your email inbox');
                          cy.contains('Resend email');
                          cy.contains('Email sent');
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
