import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  chromeWebSecurity: false,
  defaultCommandTimeout: 12000,
  responseTimeout: 12000,
  requestTimeout: 12000,
  env: {
    mockingEndpoint: 'localhost:9000/mock',
  },
  e2e: {
    baseUrl: 'https://profile.thegulocal.com',
    specPattern: 'cypress/integration/**/*.cy.ts',
    excludeSpecPattern: '*.shared.ts',
  },
});
