import userStatuses from '../../support/okta/userStatuses';
import ResponseFixture from '../../support/types/ResponseFixture';

beforeEach(() => {
  cy.mockPurge();
});

userStatuses.forEach((status) => {
  context(`Given I am a ${status || 'nonexistent'} user`, () => {
    context('When I submit the form on /reset-password', () => {
      beforeEach(() => {
        cy.visit(`/reset-password?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
    context('When I submit the form on /reset-password/email-sent', () => {
      beforeEach(() => {
        // We mock the encrypted state cookie here to trick the endpoint
        // into thinking we've just gone through the preceeding flow.
        // For readEncryptedStateCookie to succeed, it relies on a testing
        // env variable to be set, otherwise it won't be able to read the cookie.
        cy.setEncryptedStateCookie({
          email: 'example@example.com',
          status: String(status),
        });
        cy.visit(`/reset-password/email-sent?useOkta=true`);
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
    context('When I submit the form on /reset-password/resend', () => {
      beforeEach(() => {
        cy.visit(`/reset-password/resend?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
    context('When I submit the form on /reset-password/expired', () => {
      beforeEach(() => {
        cy.visit(`/reset-password/expired?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
    context('When I submit the form on /set-password/email-sent', () => {
      beforeEach(() => {
        // We mock the encrypted state cookie here to trick the endpoint
        // into thinking we've just gone through the preceeding flow.
        // For readEncryptedStateCookie to succeed, it relies on a testing
        // env variable to be set, otherwise it won't be able to read the cookie.
        cy.setEncryptedStateCookie({
          email: 'example@example.com',
          status: String(status),
        });
        cy.visit(`/set-password/email-sent?useOkta=true`);
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes').should('not.exist');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes').should('not.exist');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });
    context('When I submit the form on /set-password/resend', () => {
      beforeEach(() => {
        cy.visit(`/set-password/resend?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes').should('not.exist');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes').should('not.exist');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
      }
    });

    context('When I submit the form on /set-password/expired', () => {
      beforeEach(() => {
        cy.visit(`/set-password/expired?useOkta=true`);
        cy.get('input[name="email"]').type('example@example.com');
      });
      switch (status) {
        case false:
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/error/user-not-found').then(
                (userNotFoundError: ResponseFixture) => {
                  cy.mockNext(
                    userNotFoundError.code,
                    userNotFoundError.response,
                  );
                  cy.get('button[type=submit]').click();
                  cy.contains('Check your email inbox');
                  cy.contains('Resend email');
                  cy.contains('Email sent');
                  cy.contains('within 2 minutes').should('not.exist');
                },
              );
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture(
                    'okta-responses/success/forgot-password-email-factor',
                  ).then((forgotPasswordResponse: ResponseFixture) => {
                    // Set the correct user status on the response
                    const response = { ...userResponse.response, status };
                    cy.mockNext(userResponse.code, response);
                    cy.mockNext(
                      forgotPasswordResponse.code,
                      forgotPasswordResponse.response,
                    );
                    cy.get('button[type=submit]').click();
                    cy.contains('Check your email inbox');
                    cy.contains('Resend email');
                    cy.contains('Email sent');
                    cy.contains('within 2 minutes').should('not.exist');
                  });
                },
              );
            },
          );
          break;
        case 'PROVISIONED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'STAGED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/token').then(
                    (tokenResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(tokenResponse.code, tokenResponse.response);
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
                    },
                  );
                },
              );
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              cy.fixture('okta-responses/success/user').then(
                (userResponse: ResponseFixture) => {
                  cy.fixture('okta-responses/success/reset-password').then(
                    (resetPasswordResponse: ResponseFixture) => {
                      // Set the correct user status on the response
                      const response = { ...userResponse.response, status };
                      cy.mockNext(userResponse.code, response);
                      cy.mockNext(
                        resetPasswordResponse.code,
                        resetPasswordResponse.response,
                      );
                      cy.get('button[type=submit]').click();
                      cy.contains('Check your email inbox');
                      cy.contains('Resend email');
                      cy.contains('Email sent');
                      cy.contains('within 2 minutes').should('not.exist');
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
