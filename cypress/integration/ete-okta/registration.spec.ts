import {
  randomMailosaurEmail,
  randomPassword,
} from '../../support/commands/testUser';

describe('Registration flow', () => {
  context('Registering with Okta', () => {
    it('successfully registers using an email with no existing account', () => {
      const encodedReturnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
      const unregisteredEmail = randomMailosaurEmail();
      const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
      const refViewId = 'testRefViewId';
      const clientId = 'jobs';

      cy.visit(
        `/register?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&useOkta=true`,
      );

      const timeRequestWasMade = new Date();
      cy.get('input[name=email]').type(unregisteredEmail);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(unregisteredEmail);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        unregisteredEmail,
        timeRequestWasMade,
        /welcome\/([^"]*)/,
      ).then(({ body, token }) => {
        expect(body).to.have.string('Complete registration');
        cy.visit(`/welcome/${token}`);
        cy.contains('Create password');

        cy.get('form')
          .should('have.attr', 'action')
          .and('match', new RegExp(encodedReturnUrl))
          .and('match', new RegExp(refViewId))
          .and('match', new RegExp(encodedRef))
          .and('match', new RegExp(clientId));

        //we are reloading here to make sure the params are persisted even on page refresh
        cy.reload();

        cy.get('input[name="password"]').type(randomPassword());
        cy.get('button[type="submit"]').click();
        cy.url().should('contain', encodedReturnUrl);
        cy.url().should('contain', refViewId);
        cy.url().should('contain', encodedRef);
        cy.url().should('contain', clientId);
      });
    });

    it('successfully blocks the password set page /welcome if a password has already been set', () => {
      const unregisteredEmail = randomMailosaurEmail();
      cy.visit(`/register?useOkta=true`);

      const timeRequestWasMade = new Date();
      cy.get('input[name=email]').type(unregisteredEmail);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(unregisteredEmail);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        unregisteredEmail,
        timeRequestWasMade,
        /welcome\/([^"]*)/,
      ).then(({ body, token }) => {
        expect(body).to.have.string('Complete registration');
        cy.visit(`/welcome/${token}`);
        cy.contains('Create password');

        cy.get('input[name="password"]').type(randomPassword());
        cy.get('button[type="submit"]').click();
        cy.url().should('contain', '/consents/');
        cy.go('back');
        cy.url().should('contain', '/welcome/');
        cy.contains('Password already set for');
      });
    });

    it('completes registration and overrides returnUrl from encryptedStateCookie if one set on welcome page url', () => {
      const encodedReturnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
      const unregisteredEmail = randomMailosaurEmail();

      cy.visit(`/register?returnUrl=${encodedReturnUrl}&useOkta=true`);

      const timeRequestWasMade = new Date();
      cy.get('input[name=email]').type(unregisteredEmail);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(unregisteredEmail);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        unregisteredEmail,
        timeRequestWasMade,
        /welcome\/([^"]*)/,
      ).then(({ body, token }) => {
        expect(body).to.have.string('Complete registration');
        const newReturnUrl = encodeURIComponent(
          'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
        );
        cy.visit(`/welcome/${token}&returnUrl=${newReturnUrl}`);
        cy.contains('Create password');
        cy.url()
          .should('contain', newReturnUrl)
          .and('not.contain', encodedReturnUrl);

        cy.get('form')
          .should('have.attr', 'action')
          .and('match', new RegExp(newReturnUrl))
          .and('not.match', new RegExp(encodedReturnUrl));

        //we are reloading here to make sure the params are persisted even on page refresh
        cy.reload();

        cy.get('input[name="password"]').type(randomPassword());
        cy.get('button[type="submit"]').click();
        cy.url()
          .should('contain', newReturnUrl)
          .and('not.contain', encodedReturnUrl);
      });
    });
  });
});
