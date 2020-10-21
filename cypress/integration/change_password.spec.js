/// <reference types="cypress" />

const ChangePasswordPage = require('../support/pages/change_password_page');
const ResendPasswordResetPage = require('../support/pages/resend_password_page');

describe('Password change flow', () => {
  const page = new ChangePasswordPage();
  const fakeToken = 'abcde';

  before(() => {
    cy.idapiMockPurge();
  });

  context('the user is typing password while the constraints are being updated as they type', () => {
    const successColour = 'rgb(34, 135, 77)';
    const failureColour = 'rgb(18, 18, 18)';
    const errorColour = 'rgb(199, 0, 0)';
    const atLeast6 = 'At least 6 characters';
    const mixtureOfUpperLower = 'A mixture of lower and upper case letters';
    const symbolOrNumber = 'A symbol or a number';
    const matchingRepeated = 'Passwords match';

    it('shows which constraints have been met as the user types', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);

      cy.contains(atLeast6).should('have.css', 'color', failureColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', failureColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', failureColour);

      page.inputPasswordText('aaaaaa', '');
      cy.contains(atLeast6).should('have.css', 'color', successColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', failureColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', failureColour);

      page.inputPasswordText('A', '');
      cy.contains(atLeast6).should('have.css', 'color', successColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', successColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', failureColour);

      page.inputPasswordText('1', '');
      cy.contains(atLeast6).should('have.css', 'color', successColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', successColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', successColour);

      page.inputPasswordText('', 'aaaaaaA1');
      cy.contains(atLeast6).should('have.css', 'color', successColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', successColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', successColour);
      cy.contains(matchingRepeated).should('have.css', 'color', successColour);
    });

    it('displays the errors in red when the user submits the form but there are still constraint errors', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);

      page.submitPasswordChange('aaaaaa', 'aaaaaa');

      cy.contains(atLeast6).should('have.css', 'color', successColour);
      cy.contains(mixtureOfUpperLower).should('have.css', 'color', errorColour);
      cy.contains(symbolOrNumber).should('have.css', 'color', errorColour);
      cy.contains(matchingRepeated).should('have.css', 'color', successColour);
    });
  });

  context('An expired/invalid token is used', () => {
    it('shows a resend password page', () => {
      cy.idapiMock(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('Passwords do not match', () => {
    it('shows a password mismatch error message', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('Abc123', 'Abc123Mismatch');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISMATCH);
    });
  });

  context('Enter and Confirm passwords left blank', () => {
    it('uses the standard HTML5 empty field validation', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.clickPasswordChange();
      page.getInvalidPasswordChangeField().should('have.length', 1);
      page.getInvalidPasswordChangeConfirmField().should('have.length', 1);
    });
  });

  context('Valid password entered', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      const fakeSuccessResponse = {
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'FAKE_VALUE_0',
            },
            {
              key: 'SC_GU_LA',
              value: 'FAKE_VALUE_1',
              sessionCookie: true,
            },
            {
              key: 'SC_GU_U',
              value: 'FAKE_VALUE_2',
            },
          ],
          expiresAt: 1,
        },
      };

      cy.idapiMock(200);
      cy.idapiMock(200, fakeSuccessResponse);
      page.goto(fakeToken);
      page.submitPasswordChange('Abc123', 'Abc123');
      cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
      cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
        'have.attr',
        'href',
        `${Cypress.env('DEFAULT_RETURN_URI')}/`,
      );

      // Not currently possible to test login cookie,
      // Cookie is not set to domain we can access, even in cypress.
      // e.g.
      // cy.getCookie('GU_U')
      //  .should('have.property', 'value', 'FAKE_VALUE_0');
    });
  });

  context(
    'Valid password entered and a return url with a Guardian domain is specified.',
    () => {
      it('shows password change success screen, with a redirect button linking to the return url.', () => {
        const returnUrl = 'https://news.theguardian.com';
        const fakeSuccessResponse = {
          cookies: {
            values: [
              {
                key: 'GU_U',
                value: 'FAKE_VALUE_0',
              },
              {
                key: 'SC_GU_LA',
                value: 'FAKE_VALUE_1',
                sessionCookie: true,
              },
              {
                key: 'SC_GU_U',
                value: 'FAKE_VALUE_2',
              },
            ],
            expiresAt: 1,
          },
        };

        cy.idapiMock(200);
        cy.idapiMock(200, fakeSuccessResponse);
        page.goto(fakeToken, returnUrl);
        page.submitPasswordChange('Abc123', 'Abc123');
        cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
        cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
          'have.attr',
          'href',
          `${returnUrl}/`,
        );
      });
    },
  );

  context(
    'Valid password entered and an return url from a non-Guardian domain is specified.',
    () => {
      it('shows password change success screen, with a default redirect button.', () => {
        const returnUrl = 'https://news.badsite.com';
        const fakeSuccessResponse = {
          cookies: {
            values: [
              {
                key: 'GU_U',
                value: 'FAKE_VALUE_0',
              },
              {
                key: 'SC_GU_LA',
                value: 'FAKE_VALUE_1',
                sessionCookie: true,
              },
              {
                key: 'SC_GU_U',
                value: 'FAKE_VALUE_2',
              },
            ],
            expiresAt: 1,
          },
        };

        cy.idapiMock(200);
        cy.idapiMock(200, fakeSuccessResponse);
        page.goto(fakeToken, returnUrl);
        page.submitPasswordChange('Abc123', 'Abc123');
        cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
        cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
          'have.attr',
          'href',
          `${Cypress.env('DEFAULT_RETURN_URI')}/`,
        );
      });
    },
  );

  context('password too short', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('Abc3', 'Abc3');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_INVALID_LENGTH);
    });
  });

  context('password requires upper and lowercase', () => {
    it('shows an error informing the user that the password constraint is not met', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('abc123', 'abc123');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISSING_UPPER_LOWERCASE);
    });
  });

  context('password requires a symbol or number', () => {
    it('shows an error informing the user that the password constraint is not met', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('AbcAbc', 'AbcAbc');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISSING_NUMBER);
    });
  });

  context('password too long', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      const excessivelyLongPassword = `A1${'a'.repeat(71)}`;
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange(
        excessivelyLongPassword,
        excessivelyLongPassword,
      );
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_TOO_LONG);
    });
  });

  context('password contains a mixture of errors', () => {
    it('shows an error informing the user that multiple password constraints are not met', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('abc', 'abc');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MULTIPLE_ERRORS);
    });
  });

  context('General IDAPI failure on token read', () => {
    it('displays the password resend page', () => {
      cy.idapiMock(500);
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('General IDAPI failure on password change', () => {
    it('displays a generic error message', () => {
      cy.idapiMock(200);
      cy.idapiMock(500);
      page.goto(fakeToken);
      page.submitPasswordChange('Abc123', 'Abc123');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.GENERIC);
    });
  });

});
