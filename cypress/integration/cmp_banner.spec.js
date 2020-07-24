/// <reference types='cypress' />

const PageResetPassword = require('../support/pages/reset_password_page');

describe('Consents banner integration', () => {
  const page = new PageResetPassword();
  const BANNER_HEADING = 'Your privacy';
  const ACCEPT_BUTTON_TEXT = `I'm OK with that`;
  const OPTIONS_BUTTON_TEXT = 'Options';
  const OPTIONS_HEADING = 'Your privacy options';
  const OPTIONS_ACCEPT_BUTTON = 'Save and close';

  beforeEach(() => {
    page.goto();
  });

  it('always shows the banner, until if accepted, is dismissed and does not appear again.', () => {
    cy.contains(BANNER_HEADING);
    cy.reload();
    cy.contains(BANNER_HEADING);
    cy.contains(ACCEPT_BUTTON_TEXT).click();
    cy.contains(BANNER_HEADING).should('not.exist');
    cy.reload();
    cy.contains(BANNER_HEADING).should('not.exist');
  });

  it('always shows the banner, until options are selected, is dismissed and does not appear again', () => {
    cy.contains(BANNER_HEADING);
    cy.reload();
    cy.contains(BANNER_HEADING);
    cy.contains(OPTIONS_BUTTON_TEXT).click();
    cy.contains(OPTIONS_HEADING);
    cy.get('input[type="radio"][value="on"]')
      .each((el) => {
        cy.wrap(el).click();
      })
      .end();
    cy.contains(OPTIONS_ACCEPT_BUTTON).click();
    cy.contains(BANNER_HEADING).should('not.exist');
    cy.reload();
    cy.contains(BANNER_HEADING).should('not.exist');
  });
});
