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
