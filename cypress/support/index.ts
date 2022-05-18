// ***********************************************************
// This support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// import cypress axe for accessibility testing
import 'cypress-axe';

// import mailosaur, includes types for custom cypress commands
import 'cypress-mailosaur';

// Import commands using ES2015 syntax:
// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

export const MOCKING_ENDPOINT = 'localhost:9000/mock';

import './commands';

beforeEach(function () {
  cy.disableCMP();
});

Cypress.on('uncaught:exception', (err) => {
  // We don't want to throw an error if the consent framework isn't loaded in the tests
  // https://github.com/guardian/consent-management-platform/blob/main/src/onConsentChange.ts#L34
  if (err.message.includes('no IAB consent framework found on the page')) {
    // eslint-disable-next-line no-console
    console.warn(err);
    return false;
  }

  return true;
});
