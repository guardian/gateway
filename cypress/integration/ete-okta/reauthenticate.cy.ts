import { stringify } from 'query-string';

describe('Reauthenticate flow, Okta enabled', () => {
  beforeEach(() => {
    // Disable redirect to /signin/success by default
    cy.setCookie(
      'GU_ran_experiments',
      stringify({ OptInPromptPostSignIn: Date.now() }),
    );
  });
  it('keeps User A signed in when User A attempts to reauthenticate', () => {
    cy.createTestUser({ isUserEmailValidated: true })?.then(
      ({ emailAddress, finalPassword }) => {
        // Intercept the external redirect page.
        // We just want to check that the redirect happens, not that the page loads.
        cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
          req.reply(200);
        });
        // First, sign in
        cy.visit('/signin?useOkta=true');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');

        // Then, try to reauthenticate
        cy.visit('/reauthenticate?useOkta=true');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');

        // Get the current session data
        cy.getCookie('sid').then((sidCookie) => {
          const sid = sidCookie?.value;
          expect(sid).to.exist;
          if (sid) {
            cy.getCurrentOktaSession(sid).then((session) => {
              expect(session.login).to.equal(emailAddress);
            });
          }
        });
      },
    );
  });
  it('signs in User B when User B attempts to reauthenticate while User A is logged in', () => {
    // Create User A
    cy.createTestUser({ isUserEmailValidated: true })?.then(
      ({ emailAddress: emailAddressA, finalPassword: finalPasswordA }) => {
        // Intercept the external redirect page.
        // We just want to check that the redirect happens, not that the page loads.
        cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
          req.reply(200);
        });
        // First, sign in as User A
        cy.visit('/signin?useOkta=true');
        cy.get('input[name=email]').type(emailAddressA);
        cy.get('input[name=password]').type(finalPasswordA);
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');

        // Create User B
        cy.createTestUser({ isUserEmailValidated: true })?.then(
          ({ emailAddress: emailAddressB, finalPassword: finalPasswordB }) => {
            // Then, try to reauthenticate as User B
            cy.visit('/reauthenticate?useOkta=true');
            cy.get('input[name=email]').type(emailAddressB);
            cy.get('input[name=password]').type(finalPasswordB);
            cy.get('[data-cy="sign-in-button"]').click();
            cy.url().should('include', 'https://m.code.dev-theguardian.com/');

            // Get the current session data
            cy.getCookie('sid').then((sidCookie) => {
              const sid = sidCookie?.value;
              expect(sid).to.exist;
              if (sid) {
                cy.getCurrentOktaSession(sid).then((session) => {
                  expect(session.login).to.equal(emailAddressB);
                });
              }
            });
          },
        );
      },
    );
  });
});
