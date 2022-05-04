declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      disableCMP: typeof disableCMP;
      enableCMP: typeof enableCMP;
      acceptCMP: typeof acceptCMP;
      declineCMP: typeof declineCMP;
    }
  }
}

export const disableCMP = () => {
  return cy.setCookie('gu-cmp-disabled', 'true', {
    log: true,
  });
};

export const enableCMP = () => {
  return cy.setCookie('gu-cmp-disabled', 'false', {
    log: true,
  });
};

const cmpIframe = () => {
  return cy
    .get('iframe[id^="sp_message_iframe"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
};

const privacySettingsIframe = () => {
  return cy
    .get('[src*="https://cdn.privacy-mgmt.com/privacy-manager"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
};

export const acceptCMP = () => {
  cmpIframe().find("[title='Yes, I’m happy']").click().wait(2000);
};

export const declineCMP = () => {
  cmpIframe().find("[title='Manage my cookies']").click();
  privacySettingsIframe().contains('Privacy settings');
  privacySettingsIframe()
    .find("[title='Reject all']", { timeout: 2000 })
    .click()
    .wait(2000);
};
