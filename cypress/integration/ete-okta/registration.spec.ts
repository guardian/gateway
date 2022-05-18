import {
  randomMailosaurEmail,
  randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

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
    it('should send an ACTIVE user a reset password email with no activation token', () => {
      cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
        cy.getTestOktaUser(emailAddress).then((oktaUser) => {
          expect(oktaUser.status).to.eq(Status.ACTIVE);

          cy.visit('/register?useOkta=true');
          const timeRequestWasMade = new Date();

          cy.get('input[name=email]').type(emailAddress);
          cy.get('[data-cy="register-button"]').click();

          cy.contains('Check your email inbox');
          cy.contains(emailAddress);
          cy.contains('Resend email');
          cy.contains('Change email address');

          cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
            ({ links, body }) => {
              expect(body).to.have.string('This account already exists');
              expect(body).to.have.string('Sign in');
              expect(body).to.have.string('Reset password');
              expect(links.length).to.eq(3);
              const resetPasswordLink = links.find((s) =>
                s.text?.includes('Reset password'),
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'useOkta=true',
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'reset-password',
              );
              cy.visit(`/reset-password?useOkta=true`);
              cy.contains('Forgot password');
              cy.contains('Reset password');
            },
          );
        });
      });
    });
    it('should send a RECOVERY user a reset password email with an Okta activation token', () => {
      cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
        cy.resetOktaUserPassword(emailAddress).then(() => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.RECOVERY);

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
              expect(body).to.have.string('Password reset');
              expect(body).to.have.string('Reset password');
              expect(links.length).to.eq(2);
              const resetPasswordLink = links.find((s) =>
                s.text?.includes('Reset password'),
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'useOkta=true',
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'reset-password',
              );
              cy.visit(`/reset-password/${token}`);
              cy.contains('Reset password');
              cy.contains(emailAddress);
            });
          });
        });
      });
    });
    it('should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token', () => {
      cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
        cy.expireOktaUserPassword(emailAddress).then(() => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

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
              expect(body).to.have.string('Password reset');
              expect(body).to.have.string('Reset password');
              expect(links.length).to.eq(2);
              const resetPasswordLink = links.find((s) =>
                s.text?.includes('Reset password'),
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'useOkta=true',
              );
              expect(resetPasswordLink?.href ?? '').to.have.string(
                'reset-password',
              );
              cy.visit(`/reset-password/${token}`);
              cy.contains('Reset password');
              cy.contains(emailAddress);
            });
          });
        });
      });
    });
    it('should display an error if a SUSPENDED user attempts to register', () => {
      cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
        cy.suspendOktaUser(emailAddress).then(() => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.SUSPENDED);

            cy.visit('/register?useOkta=true');

            cy.get('input[name=email]').type(emailAddress);
            cy.get('[data-cy="register-button"]').click();

            cy.contains('There was a problem registering, please try again.');
          });
        });
      });
    });
  });

  context(
    'Existing users asking for an email to be resent after attempting to register with Okta',
    () => {
      it('should resend a STAGED user a set password email with an Okta activation token', () => {
        cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.STAGED);

            cy.visit('/register?useOkta=true');

            let timeRequestWasMade = new Date();

            cy.get('input[name=email]').type(emailAddress);
            cy.get('[data-cy="register-button"]').click();

            cy.contains('Check your email inbox');
            cy.contains(emailAddress);
            cy.contains('Resend email');
            cy.contains('Change email address');

            // Wait for the first email to arrive...
            cy.checkForEmailAndGetDetails(
              emailAddress,
              timeRequestWasMade,
              /set-password\/([^"]*)/,
            ).then(() => {
              timeRequestWasMade = new Date();

              cy.get('[data-cy="main-form-submit-button"]').click();

              // ...before waiting for the second email to arrive
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

      it('should resend a PROVISIONED user a set password email with an Okta activation token', () => {
        cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
          cy.activateTestOktaUser(emailAddress).then(() => {
            cy.getTestOktaUser(emailAddress).then((oktaUser) => {
              expect(oktaUser.status).to.eq(Status.PROVISIONED);

              cy.visit('/register?useOkta=true');

              let timeRequestWasMade = new Date();

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
              ).then(() => {
                timeRequestWasMade = new Date();
                cy.get('[data-cy="main-form-submit-button"]').click();

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
      });
      it('should send an ACTIVE user a reset password email with no activation token', () => {
        cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
          cy.getTestOktaUser(emailAddress).then((oktaUser) => {
            expect(oktaUser.status).to.eq(Status.ACTIVE);

            cy.visit('/register?useOkta=true');
            let timeRequestWasMade = new Date();

            cy.get('input[name=email]').type(emailAddress);
            cy.get('[data-cy="register-button"]').click();

            cy.contains('Check your email inbox');
            cy.contains(emailAddress);
            cy.contains('Resend email');
            cy.contains('Change email address');

            cy.checkForEmailAndGetDetails(
              emailAddress,
              timeRequestWasMade,
            ).then(() => {
              timeRequestWasMade = new Date();
              cy.get('[data-cy="main-form-submit-button"]').click();

              cy.checkForEmailAndGetDetails(
                emailAddress,
                timeRequestWasMade,
              ).then(({ links, body }) => {
                expect(body).to.have.string('This account already exists');
                expect(body).to.have.string('Sign in');
                expect(body).to.have.string('Reset password');
                expect(links.length).to.eq(3);
                const resetPasswordLink = links.find((s) =>
                  s.text?.includes('Reset password'),
                );
                expect(resetPasswordLink?.href ?? '').to.have.string(
                  'useOkta=true',
                );
                expect(resetPasswordLink?.href ?? '').to.have.string(
                  'reset-password',
                );
                cy.visit(`/reset-password?useOkta=true`);
                cy.contains('Forgot password');
                cy.contains('Reset password');
              });
            });
          });
        });
      });
      it('should send a RECOVERY user a reset password email with an Okta activation token', () => {
        cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
          cy.resetOktaUserPassword(emailAddress).then(() => {
            cy.getTestOktaUser(emailAddress).then((oktaUser) => {
              expect(oktaUser.status).to.eq(Status.RECOVERY);

              cy.visit('/register?useOkta=true');
              let timeRequestWasMade = new Date();

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
              ).then(() => {
                timeRequestWasMade = new Date();
                cy.get('[data-cy="main-form-submit-button"]').click();

                cy.checkForEmailAndGetDetails(
                  emailAddress,
                  timeRequestWasMade,
                  /set-password\/([^"]*)/,
                ).then(({ links, body, token }) => {
                  expect(body).to.have.string('Password reset');
                  expect(body).to.have.string('Reset password');
                  expect(links.length).to.eq(2);
                  const resetPasswordLink = links.find((s) =>
                    s.text?.includes('Reset password'),
                  );
                  expect(resetPasswordLink?.href ?? '').to.have.string(
                    'useOkta=true',
                  );
                  expect(resetPasswordLink?.href ?? '').to.have.string(
                    'reset-password',
                  );
                  cy.visit(`/reset-password/${token}`);
                  cy.contains('Reset password');
                  cy.contains(emailAddress);
                });
              });
            });
          });
        });
      });
      it('should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token', () => {
        cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
          cy.expireOktaUserPassword(emailAddress).then(() => {
            cy.getTestOktaUser(emailAddress).then((oktaUser) => {
              expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

              cy.visit('/register?useOkta=true');
              let timeRequestWasMade = new Date();

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
              ).then(() => {
                timeRequestWasMade = new Date();
                cy.get('[data-cy="main-form-submit-button"]').click();

                cy.checkForEmailAndGetDetails(
                  emailAddress,
                  timeRequestWasMade,
                  /set-password\/([^"]*)/,
                ).then(({ links, body, token }) => {
                  expect(body).to.have.string('Password reset');
                  expect(body).to.have.string('Reset password');
                  expect(links.length).to.eq(2);
                  const resetPasswordLink = links.find((s) =>
                    s.text?.includes('Reset password'),
                  );
                  expect(resetPasswordLink?.href ?? '').to.have.string(
                    'useOkta=true',
                  );
                  expect(resetPasswordLink?.href ?? '').to.have.string(
                    'reset-password',
                  );
                  cy.visit(`/reset-password/${token}`);
                  cy.contains('Reset password');
                  cy.contains(emailAddress);
                });
              });
            });
          });
        });
      });
    },
  );
});
