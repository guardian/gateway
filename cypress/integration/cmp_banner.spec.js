/// <reference types='cypress' />

const PageResetPassword = require('../support/pages/reset_password_page');

describe('Consents banner integration', () => {
  const page = new PageResetPassword();

  beforeEach(() => {
    page.goto();
  });

  it('shows the banner, which if accepted, is dismissed and does not appear again.', () => {
    const BANNER_HEADING = 'Your privacy';
    const BUTTON_TEXT = `I'm OK with that`;
    cy.contains(BANNER_HEADING);
    cy.contains(BUTTON_TEXT).click();
    cy.contains(BANNER_HEADING).should('not.exist');
    cy.reload();
    cy.contains(BANNER_HEADING).should('not.exist');
  });
});
