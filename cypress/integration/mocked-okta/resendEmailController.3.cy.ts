import userStatuses from '../../support/okta/userStatuses';
import userExistsError from '../../fixtures/okta-responses/error/user-exists.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import successTokenResponse from '../../fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';

beforeEach(() => {
  cy.mockPurge();
});
const verifyInRegularEmailSentPage = () => {
  cy.contains('Check your email inbox');
  cy.contains('Resend email');
  cy.contains('Email sent');
  cy.contains('within 2 minutes').should('not.exist');
};
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
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          //i Think this is the same as register.. I don't know if I should add the modked social user here
          // when the execution doesn't check the credentials part of the response
          break;
        case 'PROVISIONED':
        case 'STAGED':
          // Then Gateway should generate an activation token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                successTokenResponse.code,
                successTokenResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          // Then Gateway should generate a reset password token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                resetPasswordResponse.code,
                resetPasswordResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
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
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              cy.contains('Check your email inbox');
              cy.contains('Resend email');
              cy.contains('Email sent');
            },
          );
          break;
        case 'PROVISIONED':
        case 'STAGED':
          // Then Gateway should generate an activation token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                successTokenResponse.code,
                successTokenResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          // Then Gateway should generate a reset password token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                resetPasswordResponse.code,
                resetPasswordResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
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
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'PROVISIONED':
        case 'STAGED':
          // Then Gateway should generate an activation token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                successTokenResponse.code,
                successTokenResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          // Then Gateway should generate a reset password token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                resetPasswordResponse.code,
                resetPasswordResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
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
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'ACTIVE':
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
        case 'PROVISIONED':
        case 'STAGED':
          // Then Gateway should generate an activation token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                successTokenResponse.code,
                successTokenResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              cy.contains('Check your email inbox');
              cy.contains('Resend email');
              cy.contains('Email sent');
            },
          );
          break;
        case 'RECOVERY':
        case 'PASSWORD_EXPIRED':
          // Then Gateway should generate a reset password token
          specify(
            "Then I should be shown the 'Check your email inbox' page",
            () => {
              // Set the correct user status on the response
              const response = { ...userResponse.response, status };
              cy.mockNext(userExistsError.code, userExistsError.response);
              cy.mockNext(userResponse.code, response);
              cy.mockNext(
                resetPasswordResponse.code,
                resetPasswordResponse.response,
              );
              cy.get('[data-cy="main-form-submit-button"]').click();
              verifyInRegularEmailSentPage();
            },
          );
          break;
      }
    });
  });
});
