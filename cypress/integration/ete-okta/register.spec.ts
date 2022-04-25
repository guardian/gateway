import { Status } from '../../../src/server/models/okta/User';

describe('Registration flow', () => {
  context('Existing users attempting to register with Okta', () => {
    it('should send a STAGED user a set password email with an Okta activation token', () => {
      // Test users created via IDAPI-with-Okta do not have the activation
      // lifecycle run at creation, so they don't transition immediately from
      // STAGED to PROVISIONED (c.f.
      // https://developer.okta.com/docs/reference/api/users/#create-user) .
      // This is useful for us as we can test STAGED users first, then test
      // PROVISIONED users in the next test by activating a STAGED user. Users
      // created through Gateway-with-Okta do have this lifecycle run, so if we
      // rebuild these tests to not use IDAPI at all, we need to figure out a
      // way to test STAGED and PROVISIONED users (probably by just passing an
      // optional `activate` prop to a createUser function).
      cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
        cy.getTestOktaUser(emailAddress).then((oktaUser) => {
          expect(oktaUser.status).to.eq(Status.STAGED);

          cy.visit('/register?useOkta=true');
          const timeRequestWasMade = new Date();

          cy.get('input[name=email]').type(emailAddress);
          cy.get('[data-cy="register-button"]').click();

          cy.contains('Check your email inbox');
          cy.contains(emailAddress);
          cy.contains('Resend email');
          cy.contains('Change email address');

          cy.checkForEmailAndGetDetails(
            emailAddress,
            timeRequestWasMade,
            /set-password\/([^"]*)/,
          ).then(({ links, body, token }) => {
            expect(body).to.have.string('This account already exists');
            expect(body).to.have.string('Sign in');
            expect(body).to.have.string('Reset password');
            expect(links.length).to.eq(3);
            const setPasswordLink = links.find((s) =>
              s.text?.includes('Reset password'),
            );
            expect(setPasswordLink?.href ?? '').to.have.string('useOkta=true');
            cy.visit(`/set-password/${token}`);
            cy.contains('Create password');
            cy.contains(emailAddress);
          });
        });
      });
    });

    it('should send a PROVISIONED user a set password email with an Okta activation token', () => {
      cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
        cy.activateTestOktaUser(emailAddress).then(() => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.PROVISIONED);

            cy.visit('/register?useOkta=true');
            const timeRequestWasMade = new Date();

            cy.get('input[name=email]').type(emailAddress);
            cy.get('[data-cy="register-button"]').click();

            cy.contains('Check your email inbox');
            cy.contains(emailAddress);
            cy.contains('Resend email');
            cy.contains('Change email address');

            cy.checkForEmailAndGetDetails(
              emailAddress,
              timeRequestWasMade,
              /set-password\/([^"]*)/,
            ).then(({ links, body, token }) => {
              expect(body).to.have.string('This account already exists');
              expect(body).to.have.string('Sign in');
              expect(body).to.have.string('Reset password');
              expect(links.length).to.eq(3);
              const setPasswordLink = links.find((s) =>
                s.text?.includes('Reset password'),
              );
              expect(setPasswordLink?.href ?? '').to.have.string(
                'useOkta=true',
              );
              cy.visit(`/set-password/${token}`);
              cy.contains('Create password');
              cy.contains(emailAddress);
            });
          });
        });
      });
    });
    it(
      'should send an ACTIVE user a reset password email with no activation token',
    );
    it(
      'should send a RECOVERY user a reset password email with an Okta activation token',
    );
    it(
      'should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token',
    );
    it('should display an error if a SUSPENDED user attempts to register');
  });
});
