import { randomPassword } from '../../support/commands/testUser';

describe('Password reset flow in Okta', () => {
  context('Account exists', () => {
    it("changes the reader's password", () => {
      const encodedReturnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
      const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
      const refViewId = 'testRefViewId';
      const clientId = 'jobs';

      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');

      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress }) => {
        cy.visit(
          `/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&useOkta=true`,
        );
        const timeRequestWasMade = new Date();

        cy.contains('Forgot password');
        cy.get('input[name=email]').type(emailAddress);

        // Continue checking the password reset flow after reCAPTCHA assertions above.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Check your email inbox');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMade,
          /reset-password\/([^"]*)/,
        ).then(({ token }) => {
          cy.visit(`/reset-password/${token}`);

          cy.get('form')
            .should('have.attr', 'action')
            .and('match', new RegExp(encodedReturnUrl))
            .and('match', new RegExp(refViewId))
            .and('match', new RegExp(encodedRef))
            .and('match', new RegExp(clientId));

          //we are reloading here to make sure the params are persisted even on page refresh
          cy.reload();

          cy.get('input[name=password]').type(randomPassword());

          cy.wait('@breachCheck');
          cy.get('[data-cy="main-form-submit-button"]')
            .click()
            .should('be.disabled');
          cy.contains('Password updated');
          cy.contains(emailAddress.toLowerCase());

          cy.url().should('contain', encodedReturnUrl);
          cy.url().should('contain', refViewId);
          cy.url().should('contain', encodedRef);
          cy.url().should('contain', clientId);
          cy.url().should('contain', 'useOkta=true');
        });
      });
    });

    it("changes the reader's password  and overrides returnUrl from encryptedStateCookie if one set on reset password page url", () => {
      const encodedReturnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';

      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');

      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress }) => {
        cy.visit(`/reset-password?returnUrl=${encodedReturnUrl}&useOkta=true`);
        const timeRequestWasMade = new Date();

        cy.contains('Forgot password');
        cy.get('input[name=email]').type(emailAddress);

        // Continue checking the password reset flow after reCAPTCHA assertions above.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Check your email inbox');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMade,
          /reset-password\/([^"]*)/,
        ).then(({ token }) => {
          const newReturnUrl = encodeURIComponent(
            'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
          );
          cy.visit(`/reset-password/${token}&returnUrl=${newReturnUrl}`);

          cy.url()
            .should('contain', newReturnUrl)
            .and('not.contain', encodedReturnUrl);

          cy.get('form')
            .should('have.attr', 'action')
            .and('match', new RegExp(newReturnUrl))
            .and('not.match', new RegExp(encodedReturnUrl));

          //we are reloading here to make sure the params are persisted even on page refresh
          cy.reload();

          cy.get('input[name=password]').type(randomPassword());

          cy.wait('@breachCheck');
          cy.get('[data-cy="main-form-submit-button"]')
            .click()
            .should('be.disabled');
          cy.contains('Password updated');
          cy.contains(emailAddress.toLowerCase());

          cy.url()
            .should('contain', newReturnUrl)
            .and('not.contain', encodedReturnUrl)
            .and('contain', 'useOkta=true');
        });
      });
    });
  });
});
