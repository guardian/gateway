import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  chromeWebSecurity: false,
  defaultCommandTimeout: 30000,
  responseTimeout: 30000,
  requestTimeout: 30000,
  env: {
    mockingEndpoint: 'localhost:9000/mock',
  },
  e2e: {
    baseUrl: 'https://profile.thegulocal.com',
    specPattern: 'cypress/integration/**/*.cy.ts',
    excludeSpecPattern: '*.shared.ts',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          // eslint-disable-next-line no-console
          console.log(`CYPRESS: ${message}`);

          return null;
        },
      });
    },
  },
});
